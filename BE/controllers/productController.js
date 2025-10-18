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

    // Handle images update
    if (images && images.length > 0) {
      const imagesToUpload = images.slice(0, 10); // Limit to 10 images
      updateData.images = await uploadMultipleImages(imagesToUpload);
    }

    // Parse numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight);
    if (updateData.colors) {
      updateData.colors = updateData.colors
        .split(",")
        .map((color) => color.trim());
    } else {
      updateData.colors = [];
    }
    if (updateData.sizes) updateData.sizes = JSON.parse(updateData.sizes);

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
