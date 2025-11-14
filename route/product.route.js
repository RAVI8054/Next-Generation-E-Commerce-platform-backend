import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {createProduct, getAllFeaturedProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLevelCatId, getAllProductsByThirdLevelCatName, getProductsCount, deleteProduct, getProduct, uploadImages, removeImageFromCloudinary, updateProduct, deleteMultipleProduct, createProdutRAMS, deleteProductRAMS, updateProductRams, deleteMultipleProductRams, getProductRams, getProductRamsById, createProdutWEIGHT, deleteProductWEIGHT, updateProductWeight, deleteMultipleProductWeight, getProductWeight, getProductWeightById, createProdutSize, deleteProductSize, updateProductSize, deleteMultipleProductSize, getProductSize, getProductSizeById} from '../controllers/product.controller.js';

const productRouter = Router();

productRouter.post('/uploadImages',auth,upload.array('images'),uploadImages);
productRouter.post('/create',auth,createProduct);
productRouter.get('/getAllProducts',getAllProducts);
productRouter.get('/getAllProductsByCatId/:id',getAllProductsByCatId);
productRouter.get('/getAllProductsByCatName',getAllProductsByCatName);
productRouter.get('/getAllProductsBySubCatId/:id',getAllProductsBySubCatId);
productRouter.get('/getAllProductsBySubCatName',getAllProductsBySubCatName);
productRouter.get('/getAllProductsByThirdLevelCat/:id',getAllProductsByThirdLevelCatId);
productRouter.get('/getAllProductsByThirdLevelCatName',getAllProductsByThirdLevelCatName);
productRouter.get('/getAllProductsByPrice',getAllProductsByPrice);
productRouter.get('/getAllProductsByRating',getAllProductsByRating);
productRouter.get('/getAllProductsCount',getProductsCount);
productRouter.get('/getAllFeaturedProducts',getAllFeaturedProducts);
productRouter.delete('/:id',deleteProduct);
productRouter.delete('/deleteMultiple',deleteMultipleProduct);
productRouter.get('/:id',getProduct);
productRouter.delete('/deleteImage',auth,removeImageFromCloudinary);
productRouter.put('/updateProduct/:id',auth,updateProduct);
productRouter.post('/productRAMS/create',auth,createProdutRAMS);
productRouter.delete('/productRAMS/:id',deleteProductRAMS);
productRouter.put('/productRAMS/:id',auth,updateProductRams);
productRouter.delete('/productRAMS/deleteMultipleRAMS',deleteMultipleProductRams);
productRouter.get('/productRAMS/get',getProductRams);
productRouter.get('/productRAMS/:id',getProductRamsById);

productRouter.post('/productWeight/create',auth,createProdutWEIGHT);
productRouter.delete('/productWeight/:id',deleteProductWEIGHT);
productRouter.put('/productWeight/:id',auth,updateProductWeight);
productRouter.delete('/productweight/deleteMultipleWeight',deleteMultipleProductWeight);
productRouter.get('/productWeight/get',getProductWeight);
productRouter.get('/productweight/:id',getProductWeightById);

productRouter.post('/productSize/create',auth,createProdutSize);
productRouter.delete('/productSize/:id',deleteProductSize);
productRouter.put('/productSize/:id',auth,updateProductSize);
productRouter.delete('/productSize/deleteMultipleSize',deleteMultipleProductSize);
productRouter.get('/productSize/get',getProductSize);
productRouter.get('/productSize/:id',getProductSizeById);


export default productRouter;