export const stripHTML = (str)=>{
    return str.replace(/(<([^>]+)>)/gi, "")
};

export const fetchCommerce = (path)=>{
    // Returns promise
    const url = `https://api.chec.io/${path}`;
    const headers = {
        "X-Authorization": process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
    };
    return fetch(url, {
        method: "GET",
        headers: headers,
    });
}
