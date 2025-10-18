import User from '../models/User.js';
import Category from '../models/Category.js';

export const initializeData = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@ecommerce.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        isApproved: true
      });
      
      await adminUser.save();
      console.log('Admin user created: admin@ecommerce.com / admin123');
    }
    
    // Check if categories exist
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Electronics', description: 'Electronic devices and gadgets' },
        { name: 'Clothing', description: 'Fashion and apparel' },
        { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
        { name: 'Books', description: 'Books and educational materials' },
        { name: 'Sports', description: 'Sports equipment and accessories' }
      ];
      
      await Category.insertMany(defaultCategories);
      console.log('Default categories created');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};
