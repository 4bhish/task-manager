const asyncHandler =  (requestHandler) => (req,res,next) =>  Promise.resolve(requestHandler(req,res,next)).catch((e) => next(e)
)




const asyncHandlerTwo = (requestHandler) => async (req,res,next) => {
    try{
        await fnc(req,res,next)
    }
    catch(error){
        return res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
}

export {asyncHandler}