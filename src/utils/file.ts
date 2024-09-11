export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Read file as DataURL (Base64)
    reader.onload = () => resolve(reader.result as string); // Resolve with Base64 string
    reader.onerror = error => reject(error); // Reject in case of an error
  });
}

export type LocalStorageFile = {
  name: string
  size: number
  type: string
  body: string
  lastModified: number
}

export const fileToLocalStorage = async (file: File): Promise<LocalStorageFile> => {
  const {name, size, type, lastModified} = file
  const body = await fileToBase64(file)
  return {name, size, type, body, lastModified}
}


export function localStorageToFile(storageFile: LocalStorageFile): File {
  // Split the base64 string to get the actual Base64 data
  const {name, type, body, lastModified} = storageFile
  const byteString = atob(body.split(',')[1]); // Decode the base64 to binary string
  const byteArray = new Uint8Array(byteString.length); // Create an array for binary data
  for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
  }
  // Convert the byte array into a Blob
  const blob = new Blob([byteArray], { type });
  // Return the Blob as a File object (optional step)
  return new File([blob], name, { type, lastModified});
}

export function downloadFile(file: File) {
  const fileURL = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = fileURL;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(fileURL);
}