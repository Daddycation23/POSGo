import * as ImagePicker from 'expo-image-picker';

export async function pickImage(): Promise<ImagePicker.ImagePickerResult | undefined> {
  if (typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
              resolve({
                cancelled: false,
                assets: [{ uri: result }],
              } as ImagePicker.ImagePickerResult);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  } else {
    return ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  }
}
