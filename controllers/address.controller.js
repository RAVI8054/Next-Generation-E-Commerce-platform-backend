import AddressModel from "../models/address.model.js";
import UserModel from './../models/user.model.js';

export const addAddressController = async (request, response) => {
    try {
        const { address_line1, city, state, pincode, country, mobile, status } = request.body

        const userId = request.userId
        if (!address_line1 || !pincode || !country || !mobile || !status) {
            return response.status(500).json({
                message: "please provideall tha fields",
                error: true,
                success: false

            })
        }

        const address = new AddressModel({
            address_line1, city, state, pincode, country, mobile, status, userId
        })
        const savedAddress = await address.save()

        const updateCartUser = await UserModel.updateOne({ _id: userId }, {
            $push: {
                address_details: savedAddress?._id
            }
        })
        return response.status(200).json({
            data: savedAddress,
            message: "address saved",
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false

        })
    }
}
