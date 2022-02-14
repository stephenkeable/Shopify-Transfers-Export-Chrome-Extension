# Shopify Transfers CSV Export Chrome Extension

Well that didn't last too long, appears Shopify have removed the `/transfers/[id].json` endpoints, other objects like orders and products still have their `.json` methods. But not transfers, sigh!

~~**Warning, this uses undocumented Shopify endpoints, so it might stop working if they change these**~~

Install to Chrome as an unpacked extension as per this answer on SO:-
https://stackoverflow.com/questions/24577024/install-chrome-extension-form-outside-the-chrome-web-store

Pin to your toolbar if needed, then when you visit the Transfers within your Shopify Admin the icon will be active.

Click the icon to show a basic popup, with an Export Transfer button.  
This will fetch the JSON version of the transfer you are on which contains basic info and an array of Line Item IDs and quantities.  
We then iterate over that and grab the product and variant info and append into the line_items array item.  
Then after that we convert the JSON obejct into a CSV (via very basic methods) and pass it to your browser to download.

## Customising

This is designed as a starting point for an experienced dev to modify to a store's needs.

popup.js - You can modify the CSV export by changing the `headers` and `theRow` arrays, in order to add fields you need
Available options can be found in the Shopify docs:-   
https://shopify.dev/api/admin-rest/2022-01/resources/product#[get]/admin/api/2022-01/products/{product_id}.json   
https://shopify.dev/api/admin-rest/2022-01/resources/product-variant#[get]/admin/api/2022-01/variants/{variant_id}.json  
Metafields is using an undocumented endpoint - /admin/api/2021-10/variants/${variantId}/metafields.json
 
## Metafields

When originally built the merchant required a specific metafield that they used to store Bin Location of variants, so that they could export the list of incoming items and print it out to check the delviery then store it in the correct lcoations around their warehouse.

As such the metafields code, was built to grab that field only, however could be modified for other metafields.

There are commented out parts of `popup.js` and `contentScript.js` which can be enabled and modified as needed. Also `popup.html` has a button that can be shown, to allow export with or without the metafields.

### Credits

This tutorial from Prateek Surana was very useful in building this - https://betterprogramming.pub/the-ultimate-guide-to-building-a-chrome-extension-4c01834c63ec 
