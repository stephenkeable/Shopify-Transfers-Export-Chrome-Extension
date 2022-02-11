const exportBtn = document.getElementById('export');
exportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'EXPORT_TRANSFER' });
    })
})

const exportLocationsBtn = document.getElementById('export_metafields');
exportLocationsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'EXPORT_METAFIELDS' });
    })
})

const arrayToCSV = (arr) => {
  var lineArray = [];
  var arrLength = arr.length;
  for (i=0;i<arrLength;i++) {
    lineArray.push(arr[i].join(","));
  }
  return lineArray.join("\n");
}

/*
    The headers array and the theRw array can be configured to your needs so you include the values and fields you need
    Available options can be found in the Shopify docs:-
    https://shopify.dev/api/admin-rest/2022-01/resources/product#[get]/admin/api/2022-01/products/{product_id}.json
    https://shopify.dev/api/admin-rest/2022-01/resources/product-variant#[get]/admin/api/2022-01/variants/{variant_id}.json
    Metafields is using an undocumented endpoint
*/
const createCsv = (transfer) => {
    const headers = [
        'SKU',
        'Product',
        'Variant',
        'PO Ref',
        'Quantity',
        'Accepted',
        'Created Date',
        'Updated Date',
        'Price',
        // Uncomment for metafield
        // 'Metafield'
    ];
    const rows = []
    rows.push(headers);

    for (item of transfer.line_items) {
        const theRow = [
            item.variant.sku,
            item.product.title,
            item.variant.title,
            transfer.reference || transfer.name,
            item.quantity,
            item.accepted_quantity,
            item.created_at,
            item.updated_at,
            item.variant.price,
        ];
        // Uncomment for metafield
        // if (item.metafields) {
        //     if(item.metafields.length > 0) {
        //         theRow.push(item.metafields[0].value)
        //     } else {
        //         theRow.push('');
        //     }
        // } else {
        //     theRow.push('');
        // }
        rows.push(theRow);
    }
    return arrayToCSV(rows);
};  

const statusOutput = document.getElementById('status');
const progressOutput = document.getElementById('progress');
const downloadBtn = document.getElementById('download');

chrome.runtime.onMessage.addListener((message, sender) => {
    console.log(sender);
    if (message.data.statusMessage) {
        statusOutput.innerText = message.data.statusMessage;
    }
    if(message.data.progressMessage) {
        progressOutput.innerText = message.data.progressMessage;
    }
    if(message.data.theTransfer) {
        const csv = createCsv(message.data.theTransfer);
        const universalBOM = "\uFEFF";
        const string = encodeURIComponent(`${universalBOM}${csv}`);
        downloadBtn.setAttribute('href', `data:text/csv; charset=utf-8,${string}`);
        downloadBtn.setAttribute('download', 'transfer.csv');
        downloadBtn.classList.remove('hide');
        downloadBtn.click();
    }
});