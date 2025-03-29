module.exports = (res, error)=>{
    res.status(500).json({
        status: false,
        message: error.message ? error.message : error
    })

}