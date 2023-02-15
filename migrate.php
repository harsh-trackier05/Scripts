<?php

$token = "";
$username = "";
$password = "";



//fetching data from freshdesk starts
function fetchingCategoryDataFromFreshDesk() {
    global $username;
    global $password;
    $remote_url = 'https://trackier.freshdesk.com/api/v2/solutions/categories';

    $opts = array(
    'http'=>array(
        'method'=>"GET",
        'header' => "Authorization: Basic " . base64_encode("$username:$password")                 
    )
    );
    $context = stream_context_create($opts);
    $file = file_get_contents($remote_url, false, $context);
    return json_decode($file);
}

function fetchingFolderDataFromFreshDesk($categoryId) {
    global $username;
    global $password;
    $remote_url = 'https://trackier.freshdesk.com/api/v2/solutions/categories/' . $categoryId . '/folders';

    $opts = array(
    'http'=>array(
        'method'=>"GET",
        'header' => "Authorization: Basic " . base64_encode("$username:$password")                 
    )
    );
    $context = stream_context_create($opts);
    $file = file_get_contents($remote_url, false, $context);
    return json_decode($file);
}

function fetchingArticleDataFromFreshDesk($folderId) {
    global $username;
    global $password;
    $remote_url = 'https://trackier.freshdesk.com/api/v2/solutions/folders/' . $folderId . '/articles';
    $opts = array(
    'http'=>array(
        'method'=>"GET",
        'header' => "Authorization: Basic " . base64_encode("$username:$password")                 
    )
    );
    $context = stream_context_create($opts);
    $file = file_get_contents($remote_url, false, $context);
    return json_decode($file);
}
//fetching data from freshdesk ends

//adding data on intercom starts
function createCollectionOnIntercom($obj) {
    global $token;
    $url = 'https://api.intercom.io/help_center/collections';
    $data = array('name' => $obj->name, 'description' => $obj->description);
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BEARER);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array( "Authorization: Bearer ". $token ));

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = json_decode(curl_exec($curl));

    curl_close($curl);

    return $result->id;
}

function createSectionOnIntercom($obj,$collectionId){
    global $token;
    $url = 'https://api.intercom.io/help_center/sections';
    $data = array('name' => $obj->name, 'parent_id' => $collectionId);
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BEARER);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array( "Authorization: Bearer ". $token ));
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $result = json_decode(curl_exec($curl));
    curl_close($curl);
    return $result->id;
}

function createArticleOnIntercom($obj,$sectionId){
    global $token;
    $url = 'https://api.intercom.io/articles';
    $data = array('author_id' => '6384777','title' => $obj->title, 'parent_id' => $sectionId, 'parent_type' => 'section', 'body' => $obj->description, 'status' => 'published', 'description' => $obj->title);
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BEARER);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array( "Authorization: Bearer ". $token ));
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $result = json_decode(curl_exec($curl));
    curl_close($curl);
    return $result->id;
}
//adding data on intercom ends


function transferData() {
    $categories  = fetchingCategoryDataFromFreshDesk();
    foreach($categories as $category) {
        $collectionId = createCollectionOnIntercom($category);
        $folders = fetchingFolderDataFromFreshDesk($category->id);
        foreach($folders as $folder) {
            $sectionId = createSectionOnIntercom($folder,$collectionId);
            $articles = fetchingArticleDataFromFreshDesk($folder->id);
            foreach($articles as $article) {
                createArticleOnIntercom($article,$sectionId);
            }
        }
    }
}
//transferData();
