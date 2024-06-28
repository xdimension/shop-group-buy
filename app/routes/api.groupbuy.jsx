import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from 'remix-utils/cors';


// get request: accept request with request: customerId, shop, productId.
// read database and return group-buy items for that customer.
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");


  if(!customerId || !shop || !productId) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET"
    });
  }

  // If customerId, shop, productId is provided, return group-buy items for that customer.
  const groupitems = await db.groupitems.findMany({
    where: {
      customerId: customerId,
      shop: shop,
      productId: productId,
    },
  });


  const response = json({
    ok: true,
    message: "Success",
    data: groupitems,
  });

  return cors(request, response);

}


// Expexted data comes from post request. If
// customerID, productID, shop
export async function action({ request }) {

  let data = await request.formData();
  data = Object.fromEntries(data);
  const customerId = data.customerId;
  const productId = data.productId;
  const shop = data.shop;
  const _action = data._action;

  if(!customerId || !productId || !shop || !_action) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop, _action",
      method: _action
    });
  }

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the groupitems
      const groupitems = await db.groupitems.create({
        data: {
          customerId,
          productId,
          shop,
        },
      });

      response = json({ message: "Product added to group buy", method: _action, is_groupbuy: true });
      return cors(request, response);

    case "PATCH":
      // Handle PATCH request logic here
      // For example, updating an existing item in the groupitems
      return json({ message: "Success", method: "Patch" });

    case "DELETE":
      // Handle DELETE request logic here (Not tested)
      // For example, removing an item from the groupitems
      await db.groupitems.deleteMany({
        where: {
          customerId: customerId,
          shop: shop,
          productId: productId,
        },
      });

      response = json({ message: "Product removed from your group buy", method: _action, is_groupbuy: false });
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }

}
