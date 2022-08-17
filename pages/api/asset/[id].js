export default async function handler(req, res) {
    const { id } = req.query;
    const url = `https://api.chec.io/v1/assets/${id}`;
    const headers = {
        "X-Authorization": process.env.CHEC_SECRET_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
    };
   const data = await (await fetch(url, {
                    method: "GET",
                    headers: headers,
                })).json()

    res.status(200).json({
        id: data.id,
        url: data.url
    });
}