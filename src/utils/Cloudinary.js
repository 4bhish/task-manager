import {v2 as Cloudinary} from 'cloudinary';
import fs from 'fs';

Cloudinary.config({
    cloud_name:process.env.CLOUD_NAMe,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})

const uploadOnCloudinary = async(localFilePath) =>{
    try{
        if(!localFilePath)return null;
        const response = await Cloudinary.uploader.upload(localFilePath,{resource_type:'auto'})
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error){
        console.error(error.message)
        fs.unlinkSync(localFilePath)
        return null
    }
}

export  {uploadOnCloudinary}