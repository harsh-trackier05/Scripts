const axios = require("axios");
require("dotenv").config();
const username = process.env.FRESHDESK_USERNAME;
const password = process.env.FRESHDESK_PASSWORD;
const intercomToken = process.env.INTERCOM_TOKEN;

//start
// functions for fetching info of category folder and article

let fetchingCategoryDataFromFreshDesk = async () => {
    const session_url = 'https://trackier.freshdesk.com/api/v2/solutions/categories';
    const token = `${username}:${password}`;
    const encodedToken = Buffer.from(token).toString('base64');
    let data;
    var config = {
        method: 'get',
        url: session_url,
        headers: { 'Authorization': 'Basic ' + encodedToken }
    };
    await axios(config)
        .then(function (response) {
            data = response.data;
            //console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        }
        );
    return data;
}

let fetchingFolderDataFromFreshDesk = async (categoryId) => {
    const username = '4TySmD3CCcu20eIj3Icp';
    const password = 'cfthnbvg';
    const session_url = 'https://trackier.freshdesk.com/api/v2/solutions/categories/' + categoryId + '/folders';
    const token = `${username}:${password}`;
    const encodedToken = Buffer.from(token).toString('base64');
    let data;
    var config = {
        method: 'get',
        url: session_url,
        headers: { 'Authorization': 'Basic ' + encodedToken }
    };
    await axios(config)
        .then(function (response) {
            data = response.data;
            //console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        }
        );
    return data;
}

let fetchingArticleDataFromFreshDesk = async (folderId) => {
    const username = '4TySmD3CCcu20eIj3Icp';
    const password = 'cfthnbvg';
    const session_url = 'https://trackier.freshdesk.com/api/v2/solutions/folders/' + folderId + '/articles';
    const token = `${username}:${password}`;
    const encodedToken = Buffer.from(token).toString('base64');
    let data;
    var config = {
        method: 'get',
        url: session_url,
        headers: { 'Authorization': 'Basic ' + encodedToken }
    };
    await axios(config)
        .then(function (response) {
            data = response.data;
            //console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        }
        );
    return data;
}

//functions for fetching info of category folder and article
//end


//start
// functions to create collection,section,article, on intercom
let createCollectionOnIntercom = async (data) => {
    let collection = {};
    collection.name = data.name;
    collection.description = data.description;

    const session_url = 'https://api.intercom.io/help_center/collections';
    const token = intercomToken;
    const encodedToken = Buffer.from(token).toString('base64');
    let res;
    //console.log(collection);
    var config = {
        method: 'post',
        url: session_url,
        data: collection,
        headers: { 'Authorization': 'Basic ' + encodedToken }
    };
    await axios(config)
        .then(function (response) {
            res = response.data;
            //console.log(response.data);
        })
        .catch(function (error) {
            console.log(error.response.data);
        }
        );
    return res?.id;
}

let createSectionOnIntercom = async (data, collectionId) => {
    let section = {};
    section.name = data.name;
    section.parent_id = collectionId;
    const token = intercomToken;
    const encodedToken = Buffer.from(token).toString('base64');
    const session_url = 'https://api.intercom.io/help_center/sections';
    let res;
    var config = {
        method: 'post',
        url: session_url,
        data: section,
        headers: { 'Authorization': 'Basic ' + encodedToken }
    };
    await axios(config)
        .then(function (response) {
            res = response.data;
            console.log("section created");
            //console.log(response.data);
        })
        .catch(function (error) {
            console.log(error.response.data);
        }
        );
    return res.id;
}

let createArticleOnIntercom = async (data, sectionId) => {
    let article = {};
    article.title = data.title;
    //article.description=data.description_text;
    article.description = data.title;
    article.body = data.description;
    article.author_id = "6384777";   // (Himanshu atwal id) 
    article.state = "published";
    article.parent_id = sectionId;
    article.parent_type = "section";
    const token = intercomToken;
    const encodedToken = Buffer.from(token).toString('base64');
    const session_url = 'https://api.intercom.io/articles';
    var config = {
        method: 'post',
        url: session_url,
        data: article,
        headers: { 'Authorization': 'Basic ' + encodedToken }
    };
    await axios(config)
        .then(function (response) {
            res = response.data;
            console.log("Article added");
            //console.log(response.data);
        })
        .catch(function (error) {
            console.log(error.response.data);
        }
        );
}

// functions to create collection,section,article, on intercom
//end
let i = 0;

let = transferData = async() => {
    let categorysdata = await fetchingCategoryDataFromFreshDesk();
    for(category of categorysdata) {
        let collectionId = await createCollectionOnIntercom(category);
        console.log("(*) Collection is created with ID ("+collectionId+ ") and TITLE ("+category.name+")");
        let foldersData = await fetchingFolderDataFromFreshDesk(category.id);
        for(folder of foldersData) {
            let sectionId = await createSectionOnIntercom(folder,collectionId);
            console.log("     -> Section is created with id "+sectionId);
            let articlesData = await fetchingArticleDataFromFreshDesk(folder.id);
            for(article of articlesData) {
               await createArticleOnIntercom(article,sectionId);
                console.log("           -> "+i+". Article is created with title name : "+article.title);
                i++;
            }
        }
    }
}

//transferData()


/*
//we will use three api of freshdesk for fetching data
1. https:// trackier.freshdesk.com/api/v2/solutions/categories   :> for getting all category.
2. https://trackier.freshdesk.com/api/v2/solutions/categories/31000021373/folders    :> for getting access of info about all folder of cat.
3. https:// trackier.freshdesk.com/api/v2/solutions/folders/31000032172/articles     :> for getting articles of a folder

//we will use three api of intercom for adding data
1. 'https://api.intercom.io/help_center/collections'   :> used for creating collection
2. 'https://api.intercom.io/help_center/sections'     :> used for creating section insode collection
3. 'https://api.intercom.io/articles'   :> used for creatign article inside section


freshdesk                               intercom    
-------------------------------------------------
category                                collection

1.name                              1.name
2.description                       2.description    
3. ?? visible_portal (Array)                translated_content
4. icon

-------------------------------------------------
folder                                  section

1. name                             1. name
2. description is null in all               parent_id (will put id of collection)                      
3. article_count
4. icon null in all case
5. visiblity

--------------------------------------------------
article                                 article
1.title                             1.title
2.description                       2.body
3.description_text                  3.description
4. ?? seo_data                          ?? auther id
                                         parent_id
                                         translation_content


*/