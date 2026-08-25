const fs = require('fs');

// 1. Home.jsx
try {
  let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');
  home = home.replace(
    "image: event.image || event.bannerUrl || card.image,",
    "image: (event.images && event.images.length > 0 ? event.images[0] : event.image) || event.bannerUrl || card.image,"
  );
  fs.writeFileSync('src/pages/Home.jsx', home);
} catch(e) {}

// 2. EventDetails.jsx
try {
  let details = fs.readFileSync('src/pages/EventDetails.jsx', 'utf8');
  details = details.replace(
    "const imageUrl = event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image;",
    "const primaryImage = event.images && event.images.length > 0 ? event.images[0] : event.image;\n  const imageUrl = primaryImage?.startsWith('/') ? `http://localhost:5000${primaryImage}` : primaryImage;"
  );
  fs.writeFileSync('src/pages/EventDetails.jsx', details);
} catch(e) {}

// 3. HostedEvents.jsx
try {
  let hosted = fs.readFileSync('src/pages/HostedEvents.jsx', 'utf8');
  hosted = hosted.replace(
    "src={event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image}",
    "src={(event.images && event.images.length > 0 ? event.images[0] : event.image)?.startsWith('/') ? `http://localhost:5000${event.images && event.images.length > 0 ? event.images[0] : event.image}` : (event.images && event.images.length > 0 ? event.images[0] : event.image)}"
  );
  fs.writeFileSync('src/pages/HostedEvents.jsx', hosted);
} catch(e) {}

// 4. ExploreEvents.jsx (if applicable)
try {
  let explore = fs.readFileSync('src/pages/ExploreEvents.jsx', 'utf8');
  explore = explore.replace(
    "src={event.image?.startsWith('/') ? `http://localhost:5000${event.image}` : event.image}",
    "src={(event.images && event.images.length > 0 ? event.images[0] : event.image)?.startsWith('/') ? `http://localhost:5000${event.images && event.images.length > 0 ? event.images[0] : event.image}` : (event.images && event.images.length > 0 ? event.images[0] : event.image)}"
  );
  fs.writeFileSync('src/pages/ExploreEvents.jsx', explore);
} catch(e) {}

console.log("Other files patched for images backward compatibility");
