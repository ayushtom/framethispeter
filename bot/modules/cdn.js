import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_API_KEY
);

const uploadImage = async (imageFile, identifier) => {
  const { data, error } = await supabase.storage
    .from("tweets")
    .upload(`${identifier}.png`, imageFile, { upsert: true });

  if (error) {
    console.log(error);
    return null;
  }

  console.log(`Image upload for ${identifier}`, data);
};

const downloadImage = async (identifier) => {
  const { data, error } = await supabase.storage
    .from("tweets")
    .download(`${identifier}.png`, {
      download: true,
    });

  if (error) {
    console.log(error);
    return null;
  }

  return data;
};

const deleteImages = async (ids) => {
  const idsArray = ids.map((id) => `tweets/${id}.png`);
  const { data, error } = await supabase.storage
    .from("tweets")
    .remove(idsArray);
  if (error) {
    console.log(error);
    return null;
  }
};

export { uploadImage, deleteImages, downloadImage };
