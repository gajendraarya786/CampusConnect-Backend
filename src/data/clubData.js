const clubData = [
  {
    name: "Google Developer Student Club",
    description: "Tech-focused club that hosts coding events and workshops.",
    category: "Technical",
    imageUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v123456789/gdsc.jpg`
  },
  {
    name: "UHack Club",
    description: "Hackathon and innovation club.",
    category: "Technical",
    imageUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v123456789/uhack.jpg`
  },
  {
    name: "Cultural Club",
    description: "Promotes cultural diversity through events and festivals.",
    category: "Cultural",
    imageUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v123456789/cultural.jpg`
  }
];

export default clubData;
