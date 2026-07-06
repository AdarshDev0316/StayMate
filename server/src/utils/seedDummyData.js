const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');

const seedDummyData = async () => {
  try {
    // Check if dummy owner exists
    let dummyOwner = await User.findOne({ email: 'owner@staymate.demo' });
    
    if (!dummyOwner) {
      dummyOwner = await User.create({
        name: 'Demo Owner',
        email: 'owner@staymate.demo',
        password: 'password123', // This will be hashed by pre-save hook
        role: 'owner',
        isVerified: true,
        isDummy: true,
      });
      console.log('Dummy Owner created.');
    }

    // Check if dummy tenant exists
    let dummyTenant = await User.findOne({ email: 'tenant@staymate.demo' });
    
    if (!dummyTenant) {
      dummyTenant = await User.create({
        name: 'Demo Tenant',
        email: 'tenant@staymate.demo',
        password: 'password123',
        role: 'tenant',
        isVerified: true,
        isDummy: true,
      });
      console.log('Dummy Tenant created.');
    }

    // Check if dummy listing exists
    let dummyListing = await Listing.findOne({ owner: dummyOwner._id, isDummy: true });
    
    if (!dummyListing) {
      await Listing.create({
        owner: dummyOwner._id,
        title: 'Premium 2BHK with Ocean View',
        description: 'A beautifully furnished 2BHK apartment with breathtaking ocean views. Features modern amenities, premium flooring, and a fully equipped modular kitchen. Perfect for professionals looking for a serene living space.',
        location: {
          address: 'Sea Face Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          coordinates: { lat: 19.055, lng: 72.825 }
        },
        rent: 45000,
        deposit: 100000,
        roomType: 'entire',
        furnishing: 'fully',
        amenities: ['WiFi', 'AC', 'Parking', 'Security', 'Power Backup', 'Gym'],
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1e52408437?w=800&q=80', publicId: 'dummy1' },
          { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', publicId: 'dummy2' },
          { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80', publicId: 'dummy3' }
        ],
        availableFrom: new Date(),
        preferences: {
          gender: 'any',
          occupation: 'professional',
          smoking: false,
          pets: false,
          vegetarian: false,
          maxTenants: 2
        },
        status: 'active',
        isApproved: true,
        isDummy: true,
      });
      
      await Listing.create({
        owner: dummyOwner._id,
        title: 'Cozy Shared Room in Tech Hub',
        description: 'Vibrant and modern shared living space in the heart of the tech district. High-speed internet included. 5 mins walk from metro station.',
        location: {
          address: 'Koramangala 4th Block',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
        },
        rent: 15000,
        deposit: 30000,
        roomType: 'shared',
        furnishing: 'semi',
        amenities: ['WiFi', 'Geyser', 'Washing Machine', 'Security'],
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', publicId: 'dummy4' },
          { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80', publicId: 'dummy5' }
        ],
        availableFrom: new Date(),
        preferences: {
          gender: 'any',
          occupation: 'any',
          smoking: false,
          pets: true,
          vegetarian: false,
          maxTenants: 1
        },
        status: 'active',
        isApproved: true,
        isDummy: true,
      });
      console.log('Dummy Listings created.');
    }
    
  } catch (err) {
    console.error('Error seeding dummy data:', err);
  }
};

module.exports = seedDummyData;
