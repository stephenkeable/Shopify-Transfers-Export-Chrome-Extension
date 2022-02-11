const getProduct = (productId) => new Promise((resolve, reject) => {
    const productUrl = `/admin/api/2021-10/products/${productId}.json`;
    let productRequest = new Request(productUrl);
    
    fetch(productRequest).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        response.json().then((json) => {
            resolve(json.product);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
});

const getVariant = (variantId) => new Promise((resolve, reject) => {
    const variantUrl = `/admin/api/2021-10/variants/${variantId}.json`;
    let variantRequest = new Request(variantUrl);
    
    fetch(variantRequest).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        response.json().then((json) => {
            resolve(json.variant);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
});

const getMetafield = (variantId, keyName) => new Promise((resolve, reject) => {
    const variantUrl = `/admin/api/2021-10/variants/${variantId}/metafields.json`;
    let variantRequest = new Request(variantUrl);
    
    fetch(variantRequest).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        response.json().then((json) => {
            const result = json.metafields.filter(field => field.key === keyName);
            resolve(result);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
});

const exportTransfer = (metafields = false) => {
    // Using the undocumented JSON version of the transfer page
    const transferUrl = `${window.location.href}.json`;
    let myRequest = new Request(transferUrl);

    chrome.runtime.sendMessage({ data: {
        // Update status in popup
        statusMessage: `Fetching Transfer`,
    }});
    
    fetch(myRequest).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        response.json().then(async (json) => {
            // Prep the object we'll use to build our CSV data
            const theTransfer = {};
            theTransfer.reference = json.inventory_transfer.reference || '';
            theTransfer.name = json.inventory_transfer.name || '';
            theTransfer.line_items = [];

            // Update status in popup
            chrome.runtime.sendMessage({ data: {
                statusMessage: `Transfer ${theTransfer.name} with ${json.inventory_transfer.line_items.length} line items`
            }});

            for (const [index, lineItem] of json.inventory_transfer.line_items.entries()) {
                // Update status in popup per line item
                chrome.runtime.sendMessage({ data: {
                    progressMessage: `Fetching info for ${index + 1} of ${json.inventory_transfer.line_items.length}`
                }});

                // Build the line_item object with more than just IDs
                // Grabbing just the product and variant info by default
                // Avoiding metafields unless needed to reduce the number of API hits and improve speed
                const newLineItem = lineItem;
                const productPromise = getProduct(lineItem.product_id);
                const variantPromise = getVariant(lineItem.product_variant_id);
                // Uncomment to use metafields
                // let metafieldsPromise = [];
                if (metafields === true) {
                    // Uncomment to use metafields
                    // Replace METAFIELD_KEY with the the field you need.
                    // metafieldsPromise = getMetafield(lineItem.product_variant_id, 'METAFIELD_KEY');
                }
                await Promise.all([
                    productPromise,
                    variantPromise,
                    // Uncomment to use metafields
                    // metafieldsPromise
                ]).then(([product, variant, metafields]) => {
                    newLineItem.product = product;
                    newLineItem.variant = variant;
                    // Uncomment to use metafields
                    // newLineItem.metafields = metafields;
                });
                theTransfer.line_items.push(newLineItem);
            };

            chrome.runtime.sendMessage({ data: {
                // Update status in popup
                statusMessage: `All data fetched`,
                progressMessage: '',
                theTransfer
            }});
        }).catch((error) => {
            console.log(error);
        });
    }).catch((error) => {
        console.log(error);
    });
};

chrome.runtime.onMessage.addListener(function(message){
    if(message.action === 'EXPORT_TRANSFER'){
        exportTransfer();
    }
    if(message.action === 'EXPORT_METAFIELDS'){
        exportTransfer(true);
    }
});