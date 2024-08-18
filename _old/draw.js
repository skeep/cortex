


///////////////////


// Function to convert an IP address to a numeric value
function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

// Function to convert a numeric value to an IP address
function numberToIp(num) {
    return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
    ].join('.');
}

// Function to expand a single IP range into individual IP addresses
function expandIpRange(startIp, endIp) {
    const startNum = ipToNumber(startIp);
    const endNum = ipToNumber(endIp);
    const ips = [];

    for (let num = startNum; num <= endNum; num++) {
        ips.push(numberToIp(num));
    }

    return ips;
}

// Function to parse and expand a comma-separated list of IP addresses and ranges
function parseIpList(ipList) {
    const items = ipList.split(',');
    const expandedIps = new Set(); // Use a Set to avoid duplicate IPs

    items.forEach(item => {
        item = item.trim(); // Remove extra spaces
        if (item.includes('-')) {
            // Handle IP range
            const [startIp, endIp] = item.split('-').map(ip => ip.trim());
            const rangeIps = expandIpRange(startIp, endIp);
            rangeIps.forEach(ip => expandedIps.add(ip));
        } else {
            // Handle single IP
            expandedIps.add(item);
        }
    });

    return Array.from(expandedIps);
}

// Example usage
const ipList1 = '10.0.83.101-10.0.83.125,10.0.83.11-10.0.83.12,10.0.83.37,10.0.83.94-10.0.83.95,10.0.83.138,10.0.83.209,10.0.83.212,10.0.83.218,10.0.83.222,10.0.82.51';
const ipList2 =  '10.188.41.132,10.188.41.4,10.188.41.5,10.188.41.7,10.188.41.8,10.188.46.4,10.188.46.5,10.188.46.32,10.188.46.33,10.188.46.60,10.188.46.61,10.188.46.88,10.188.46.89,10.188.46.111,10.188.46.112,10.188.46.114-10.188.46.118,10.188.46.131-10.188.46.136,10.188.47.4-10.188.47.47';
const expandedIps1 = parseIpList(ipList1);
const expandedIps2 = parseIpList(ipList2);
console.log(expandedIps1, expandedIps2);



//////////////////

// Example Sets
const set1 = new Set(expandedIps1);
const set2 = new Set(expandedIps2);

// Function to create an array of objects with from and to keys
function createArrayFromSets(set1, set2) {
    const result = [];

    // Iterate over each value in set1
    set1.forEach(fromValue => {
        // Iterate over each value in set2
        set2.forEach(toValue => {
            result.push({ from: fromValue, to: toValue });
        });
    });

    return result;
}

// Generate the array of objects
const edgesForIPs = createArrayFromSets(set1, set2);

// Output the result
console.log(edgesForIPs);


// Function to merge two sets and convert to an array of objects
function mergeAndConvertToArray(set1, set2) {
    // Merge sets
    const mergedSet = new Set([...set1, ...set2]);
    
    // Convert the merged set to an array of objects
    const result = Array.from(mergedSet).map(value => ({
        id: value,
        label: value
    }));

    return result;
}

// Generate the array of objects
const nodesForIPs = mergeAndConvertToArray(set1, set2);

// Output the result
console.log(nodesForIPs);


// Create a network graph using vis-network
const nodes = new vis.DataSet(nodesForIPs);

const edges = new vis.DataSet(edgesForIPs);

const container = document.getElementById('network');
const data = { nodes: nodes, edges: edges };
const options = {};

new vis.Network(container, data, options);