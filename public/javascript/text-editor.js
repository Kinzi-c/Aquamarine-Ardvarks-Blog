function handleImage(blobInfo) {
  const formData = new FormData();
  formData.set('image',
  blobInfo.blob())

  // upload the image to server and return `imageUrl` return
  fetch("/upload-image", {
    method: "post", body: formData,
  })
    .then((response) => response.json()) .then((res) => res.imageUrl);
}

const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches

tinymce.init({
  selector: 'textarea#article',
  promotion: false,
  branding: false,
  plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount emoticons',
  editimage_cors_hosts: ['picsum.photos'],
  menubar: 'file edit view insert format tools table help',
  toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor | fullscreen | insertfile image',
  toolbar_sticky: false,
  autosave_ask_before_unload: true,
  autosave_interval: '30s',
  autosave_prefix: '{path}{query}-{id}-',
  autosave_restore_when_empty: false,
  autosave_retention: '2m',
 // enable title field in the Image dialog
 image_title: true,
 images_upload_handler: handleImage,
 
 images_upload_base_path: '/public/images/uploadedFiles',
 images_reuse_filename: true,
 file_picker_types: 'image',
 
 // image picker
 file_picker_callback: (cb, value, meta) => {
   const input = document.createElement('input');
   input.setAttribute('type', 'file');
   input.setAttribute('accept', 'image/*');

   input.addEventListener('change', (e) => {
     const file = e.target.files[0];

     const reader = new FileReader();
     reader.addEventListener('load', () => {
       const id = 'blobid' + (new Date()).getTime();
       const blobCache =  tinymce.activeEditor.editorUpload.blobCache;
       const base64 = reader.result.split(',')[1];
       const blobInfo = blobCache.create(id, file, base64);
       blobCache.add(blobInfo);

       //call the callback and populate the Title field with the file name 
       cb(blobInfo.blobUri(), { title: file.name });
     });
     reader.readAsDataURL(file);
   });

   input.click();
 },
  templates: [{
    title: 'Test template 1',
    content: 'Test 1'
  }, {
    title: 'Test template 2',
    content: 'Test 2'
  }],
  template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
  template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
  height: 700,
  image_caption: true,
  noneditable_class: 'mceNonEditable',
  toolbar_mode: 'sliding',
  contextmenu: 'link image table',
  skin: useDarkMode ? 'oxide-dark' : 'oxide',
  content_css: useDarkMode ? 'dark' : 'default',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
});
