const advancedSearch = (model,populatingParams) => async(req,res,next) => {
    //copying req.query
    const reqQuery = {...req.query};

    //fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(field => delete reqQuery[field]);
    console.log(reqQuery);

    //creating query string
    let queryStr = JSON.stringify(reqQuery);

    //creating operators like as $gt, $lt, etc..
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|eq|ne|in|nin)\b/g, match => `$${match}`); // a/c to docs we need "$" before operators
    /*console.log(queryStr);*/

    //finding resources
    let query = model.find(JSON.parse(queryStr)).populate('noOfCourses').populate({
        path: 'courses',
        select: 'title description tuition weeks',
    });

    //selecting fields to send back to client as per requirement
    if (req.query.select) {
        const selectBy = req.query.select.split(',').join(' '); 
        query = query.select(selectBy); 
    }

    //sorting fields to send back to client as per requirement
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' '); 
        query = query.sort(sortBy); 
    } else {
        query = query.sort('-createdAt');//default sort & "-" means in descending order 
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1, limit = parseInt(req.query.limit, 10) || 10;
    const startInd = ( page - 1 ) * limit, endInd = page * limit;
    const totalDocs = await model.countDocuments();

    query = query.skip(startInd).limit(limit);

    //populating
    if(populatingParams){
        query = query.populate(populatingParams);
    }   

    //execute query
    const resourses = await query;

    //pagination result
    const pagination = {};
    
    if (endInd < totalDocs) {
        pagination.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startInd > 0) {
        pagination.prev = {
            page: page - 1,
            limit //same as limit:limit
        }
    }

    res.advancedSearch = {
        success: true,
        count: resourses.length,
        pagination,
        data: resourses,
    }
    next(); //very IMP* since it is a middleware
}

module.exports = advancedSearch;