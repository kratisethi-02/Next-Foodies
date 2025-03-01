import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import fs from "node:fs";
import { S3 } from "@aws-sdk/client-s3";

const s3 = new S3({
  region: "eu-north-1"
});
const db = sql("meals.db");

export async function getMeals() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  // throw new Error("loaing meals failed");
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ? ").get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop(); //getting the file extention
  const fileName = `${meal.slug}.${extension}`; //creating a new filename that will be stored in folder

  // const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();
  // stream.write(Buffer.from(bufferedImage), error => {
  //   if (error) {
  //     throw new Error("Saving image failed");
  //   }
  // });
  s3.putObject({
    Bucket: "krati-nextjs-foodies-app-images", // Bucket name only
    Key: `images/${fileName}`,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type
  });

  meal.image = fileName;

  //saving to db
  db
    .prepare(
      `INSERT INTO meals
    (title, summary, instructions, creator, creator_email, image, slug ) 
    VALUES(    
         @title,       
         @summary,
         @instructions,
         @creator,
         @creator_email,
         @image,
         @slug
         )
         
 `
    )
    .run(meal);
}
