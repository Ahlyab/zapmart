import * as productService from "../services/productService.js";
import {
  uploadImageToCloudinary,
  uploadMultipleImages,
} from "../utils/uploadHelper.js";

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, page, limit } = req.query;
    const products = await productService.getAllProducts({
      category,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { images } = req.files || {};

    // Upload all images
    let imageUrls = [];
    if (images && images.length > 0) {
      const imagesToUpload = images.slice(0, 10); // Limit to 10 images
      imageUrls = await uploadMultipleImages(imagesToUpload);
    }

    const productData = {
      ...req.body,
      images: imageUrls,
      price: parseFloat(req.body.price),
      weight: parseFloat(req.body.weight),
      colors: req.body.colors
        ? req.body.colors.split(",").map((color) => color.trim())
        : [],
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
    };

    const product = await productService.createProduct(
      productData,
      req.user._id
    );
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { images } = req.files || {};
    let updateData = { ...req.body };

    // Parse existingImages safely
    let existingImages = [];
    if (req.body.existingImages !== undefined) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
        if (!Array.isArray(existingImages)) existingImages = [];
      } catch {
        existingImages = [];
      }
    }

    // Upload new images (if any)
    let newImageUrls = [];
    if (images && images.length > 0) {
      const imagesToUpload = images.slice(0, 10);
      newImageUrls = await uploadMultipleImages(imagesToUpload);
    }

    // 🔒 Enforce at least one image
    const totalImages = existingImages.length + newImageUrls.length;
    if (totalImages === 0) {
      return res.status(400).json({
        message: "At least one product image is required.",
      });
    }

    // ✅ Final image set (authoritative)
    updateData.images = [...existingImages, ...newImageUrls];

    // ---- Parse numeric / structured fields ----
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight);

    if (updateData.colors) {
      updateData.colors = updateData.colors
        .split(",")
        .map(c => c.trim())
        .filter(Boolean);
    } else {
      updateData.colors = [];
    }

    if (updateData.sizes) {
      try {
        updateData.sizes = JSON.parse(updateData.sizes);
      } catch {
        updateData.sizes = [];
      }
    }

    const product = await productService.updateProduct(
      req.params.id,
      updateData,
      req.user._id
    );

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await productService.getSellerProducts(req.user._id);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
