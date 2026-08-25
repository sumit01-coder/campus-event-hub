const fs = require('fs');

let code = fs.readFileSync('src/pages/HostEvent.jsx', 'utf8');

// 1. Update initial state
code = code.replace(
  "    image: '',\n    category: 'Technology',",
  "    images: [],\n    category: 'Technology',"
);

// 2. Update handleImageUpload
const oldUploadRegex = /  const handleImageUpload = async \(e\) => \{[\s\S]*?  \};/;
const newUpload = `  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.images.length + files.length > 5) {
      toast.error('You can only upload up to 5 images.');
      return;
    }

    const uploadData = new FormData();
    files.forEach(file => {
      uploadData.append('images', file);
    });

    setIsUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const { data } = await api.post('/upload/multiple', uploadData, config);
      
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...data.imageUrls] 
      }));
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };`;

code = code.replace(oldUploadRegex, newUpload);

// 3. Update Upload UI
const oldUploadUIRegex = /<div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50\/50 hover:bg-gray-50 transition-colors relative">[\s\S]*?<\/div>\s*<\/div>/;

const newUploadUI = `<div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
                  {formData.images.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((imgUrl, index) => (
                          <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={imgUrl.startsWith('/') ? \`http://localhost:5000\${imgUrl}\` : imgUrl} alt={\`Upload \${index + 1}\`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeImage(index)} className="p-1.5 bg-white text-red-500 rounded-full hover:scale-110 transition-transform">
                                <XCircle size={16} />
                              </button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Cover</div>
                            )}
                          </div>
                        ))}
                        {formData.images.length < 5 && (
                          <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative hover:bg-white transition-colors cursor-pointer">
                            <div className="text-center">
                              <ImageIcon className="mx-auto text-gray-400 mb-1" size={20} />
                              <span className="text-xs font-medium text-gray-500">Add Image</span>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={isUploading}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formData.images.length} of 5 images uploaded</span>
                        {isUploading && <span className="flex items-center gap-1 text-primary"><Loader2 size={12} className="animate-spin"/> Uploading...</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 border border-gray-100 text-primary">
                        <ImageIcon size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Drag & drop images here</p>
                      <p className="text-xs text-gray-400 mb-4">or</p>
                      
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <button type="button" className="bg-white border border-gray-200 text-primary font-bold text-xs px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                          {isUploading ? <><Loader2 size={14} className="animate-spin"/> Uploading...</> : <><Upload size={14} /> Browse Files</>}
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 mt-4">Recommended: 1200 x 628px (JPG, PNG) • Max size: 5MB per image • Up to 5 images</p>
                    </div>
                  )}
                </div>
              </div>`;

code = code.replace(oldUploadUIRegex, newUploadUI);

// 4. Update the preview widget image on the right sidebar
// Search for formData.image ? and replace with formData.images?.length > 0 ?
const oldPreviewWidget = `{formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (`;
const newPreviewWidget = `{formData.images?.length > 0 ? (
                  <img src={formData.images[0].startsWith('/') ? \`http://localhost:5000\${formData.images[0]}\` : formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                ) : (`;
code = code.replace(oldPreviewWidget, newPreviewWidget);

fs.writeFileSync('src/pages/HostEvent.jsx', code);
console.log("Frontend refactored successfully!");
