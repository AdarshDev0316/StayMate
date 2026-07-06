const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Listing = require('./models/Listing');

dotenv.config({ path: '../.env' }); // Make sure it reads from server/.env

const dummyData = [
  {
    title: 'Luxury 3BHK Flat in Andheri West',
    description: 'A beautifully furnished 3BHK flat located in the heart of Andheri West, featuring premium amenities, sea-facing balconies, and a modular kitchen. Perfect for professionals or families seeking a luxurious stay.',
    location: {
      address: 'Sea View Apartments, Yari Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400061',
      landmark: 'Near Versova Beach',
      coordinates: { lat: 19.1351, lng: 72.8146 }
    },
    rent: 85000,
    deposit: 300000,
    roomType: 'entire',
    furnishing: 'fully',
    amenities: ['WiFi', 'AC', 'Parking', 'Security', 'Lift', 'CCTV', 'Gym', 'Swimming Pool', 'Geyser', 'Washing Machine'],
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', publicId: 'dummy_image_1' },
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1cd2cb801c?w=800&h=600&fit=crop', publicId: 'dummy_image_2' },
      { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop', publicId: 'dummy_image_3' }
    ],
    availableFrom: new Date(Date.now() + 86400000 * 5), // 5 days from now
    preferences: { gender: 'any', occupation: 'professional', smoking: false, drinking: false, pets: false, vegetarianOnly: false },
    status: 'active',
    activeDays: 120,
    views: 4520,
    interestedCount: 38,
    isPermanent: true
  },
  {
    title: 'Cozy Shared Room in Indiranagar',
    description: 'Looking for a flatmate to share a fully furnished 2BHK in Indiranagar. The room has twin beds, separate wardrobes, and an attached bathroom. The society has a gym, pool, and 24/7 security. Just 5 mins from the metro station.',
    location: {
      address: 'Sunrise Residency, 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      landmark: 'Near Indiranagar Metro',
      coordinates: { lat: 12.9784, lng: 77.6408 }
    },
    rent: 14000,
    deposit: 50000,
    roomType: 'shared',
    furnishing: 'fully',
    amenities: ['WiFi', 'Washing Machine', 'Geyser', 'Security', 'Power Backup', 'Gym', 'Play Area'],
    images: [
      { url: 'https://images.unsplash.com/photo-1598928506311-c55dd1b764b8?w=800&h=600&fit=crop', publicId: 'dummy_image_4' },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', publicId: 'dummy_image_5' }
    ],
    availableFrom: new Date(Date.now() + 86400000 * 2), // 2 days from now
    preferences: { gender: 'male', occupation: 'student', smoking: false, drinking: false, pets: false, vegetarianOnly: false },
    status: 'active',
    activeDays: 45,
    views: 1250,
    interestedCount: 15,
    isPermanent: true
  },
  {
    title: 'Premium Studio Flat in Cyber City',
    description: 'A highly sought-after studio flat located right next to Cyber Hub. Unfurnished so you can set it up your way. Features central AC, smart home features, and covered parking. Ideal for tech professionals working in DLF Cyber City.',
    location: {
      address: 'DLF Phase 2, Sector 24',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      landmark: 'Opposite Cyber Hub',
      coordinates: { lat: 28.4900, lng: 77.0888 }
    },
    rent: 28000,
    deposit: 60000,
    roomType: 'single',
    furnishing: 'unfurnished',
    amenities: ['AC', 'Parking', 'Security', 'Power Backup', 'Lift', 'CCTV', 'Gym'],
    images: [
      { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop', publicId: 'dummy_image_6' },
      { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop', publicId: 'dummy_image_7' },
      { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop', publicId: 'dummy_image_8' }
    ],
    availableFrom: new Date(Date.now() + 86400000 * 15), // 15 days from now
    preferences: { gender: 'any', occupation: 'professional', smoking: false, drinking: true, pets: true, vegetarianOnly: false },
    status: 'active',
    activeDays: 200,
    views: 8900,
    interestedCount: 102,
    isPermanent: true
  },
  {
    title: 'Spacious 2BHK Near IT Park, Hinjewadi',
    description: 'Semi-furnished 2BHK flat available for rent in a gated society near Hinjewadi Phase 1. Comes with modular kitchen, wardrobes in both rooms, and electrical fittings. Huge balcony overlooking the IT park.',
    location: {
      address: 'Blue Ridge Township, Hinjewadi',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      landmark: 'Near Phase 1 IT Park',
      coordinates: { lat: 18.5913, lng: 73.7389 }
    },
    rent: 22000,
    deposit: 50000,
    roomType: 'entire',
    furnishing: 'semi',
    amenities: ['Parking', 'Security', 'Lift', 'Geyser', 'Clubhouse', 'Garden', 'Play Area'],
    images: [
      { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', publicId: 'dummy_image_9' },
      { url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop', publicId: 'dummy_image_10' }
    ],
    availableFrom: new Date(Date.now() + 86400000 * 10), // 10 days from now
    preferences: { gender: 'any', occupation: 'any', smoking: true, drinking: true, pets: true, vegetarianOnly: false },
    status: 'active',
    activeDays: 90,
    views: 3100,
    interestedCount: 22,
    isPermanent: true
  }
];

const seedDummyData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found in .env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Create a dummy system owner user if not exists
    let dummyOwner = await User.findOne({ email: 'system_owner@staymate.com' });
    if (!dummyOwner) {
      dummyOwner = await User.create({
        name: 'StayMate System',
        email: 'system_owner@staymate.com',
        password: 'A_Very_Long_Random_Secure_Password_123456!',
        role: 'owner',
        isEmailVerified: true
      });
      console.log('Created dummy system owner.');
    } else {
      console.log('Dummy system owner already exists.');
    }

    // 2. Insert the listings if they don't already exist (by title)
    for (const listingData of dummyData) {
      const existing = await Listing.findOne({ title: listingData.title });
      if (!existing) {
        listingData.owner = dummyOwner._id;
        await Listing.create(listingData);
        console.log(`Inserted dummy listing: ${listingData.title}`);
      } else {
        // Ensure it's marked as permanent
        existing.isPermanent = true;
        await existing.save();
        console.log(`Updated existing dummy listing to be permanent: ${listingData.title}`);
      }
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

module.exports = seedDummyData;
