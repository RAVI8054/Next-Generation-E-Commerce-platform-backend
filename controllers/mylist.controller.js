import { request, response } from 'express';
import MyListModel from './../models/myList.model.js';

export const addToMyListController = async (request, response) => {

    try {
        const userId = request.userId //middleware
        const {
            productId,
            productTitle,
            image,
            rating,
            price,
            oldPrice,
            brand,
            discount
        } = request.body

        const item = await MyListModel.findOne({
            userId: userId,
            productId: productId
        })
        if (item) {
            return response.status(400).json({
                message: "item is already in my list"
            })
        }
        const myList = new MyListModel({
            userId,
            productId,
            productTitle,
            image,
            rating,
            price,
            oldPrice,
            brand,
            discount
        })

        const save = await myList.save();
        return response.status(200).json({
            success: true,
            message: "the product saved in the my list"
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true
        })
    }
}


export const deleteToMyListController = async (request, response) => {
    try {
        const myListItem = await MyListModel.findById(request.params.id)

        if (!myListItem) {
            return response.status(404).json({
                error: true,
                message: "The item with this given id was  not found"
            })
        }
        const deletedItem = await MyListModel.findByIdAndDelete(request.params.id);

        if (!deletedItem) {
            return response.status(404).json({
                error: true,
                message: "the item is not deleted"
            })
        }

        return response.status(200).json({
            success: true,
            message: "The item removed from My List"
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true
        })
    }
}

export const getMyListController = async (request, response) => {
    try {
        const userId = request.userId;
        const myListItems = await MyListModel.find({
            userId: userId
        })

        return response.status(200).json({
            success: true,
            data: myListItems
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true
        })
    }
}