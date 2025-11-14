import jwt from "jsonwebtoken";

const auth = async (request, response, next) => {
    try {
        // Get token from cookies or Authorization header
        const token =
            request.cookies?.accessToken ||
            request?.headers?.authorization?.split(" ")[1];

        // If no token, return 401 Unauthorized
        if (!token) {
            return response.status(401).json({
                message: "Provide token",
            });
        }

        // Verify token using the secret key
        const decode = await jwt.verify(
            token,
            process.env.SECRET_KEY_ACCESS_TOKEN
        );


        if (!decode) {
            return response.status(401).json({
                message: "unauthorized access",
                error: true,
                success: false
            })
        }
        // Attach decoded data to request object for later use
        request.userId = decode.id;
        next();
    } catch (error) {
        return response.status(500).json({
            message: "You have not logged in",
            error: true,
            success: false,
        });
    }
};

export default auth;
