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

// Function to expand an IP range into individual IP addresses
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
function parseAndExpandIpList(ipList) {
    const items = ipList.split(',').map(item => item.trim());
    const allIps = new Set(); // Use a Set to avoid duplicate IPs

    items.forEach(item => {
        if (item.includes('-')) {
            // Handle IP range
            const [startIp, endIp] = item.split('-').map(ip => ip.trim());
            const rangeIps = expandIpRange(startIp, endIp);
            rangeIps.forEach(ip => allIps.add(ip));
        } else {
            // Handle single IP
            allIps.add(item);
        }
    });

    return Array.from(allIps);
}

// Function to optimize a list of IP addresses into the largest possible ranges
function optimizeIpRanges(ipAddresses) {
    // Convert IP addresses to numeric values
    const numericIps = ipAddresses.map(ip => ipToNumber(ip));
    
    // Sort numeric IP addresses
    numericIps.sort((a, b) => a - b);
    
    const ranges = [];
    let start = numericIps[0];
    let end = start;

    // Traverse the sorted list to form ranges
    for (let i = 1; i < numericIps.length; i++) {
        if (numericIps[i] === end + 1) {
            end = numericIps[i];
        } else {
            // If not contiguous, push the previous range and start a new one
            ranges.push({ start: numberToIp(start), end: numberToIp(end) });
            start = numericIps[i];
            end = start;
        }
    }

    // Push the last range
    ranges.push({ start: numberToIp(start), end: numberToIp(end) });

    return ranges;
}

// Function to format ranges to a Set with individual IP addresses or ranges
function formatRangesToSet(ranges) {
    const formatted = new Set();

    ranges.forEach(range => {
        if (range.start === range.end) {
            formatted.add(range.start); // Single IP address
        } else {
            formatted.add(`${range.start}-${range.end}`); // Range
        }
    });

    return formatted;
}

// Example usage
const ipList1 = '10.0.83.101-10.0.83.125,10.0.83.11-10.0.83.12,10.0.83.37,10.0.83.94-10.0.83.95,10.0.83.138,10.0.83.209,10.0.83.212,10.0.83.218,10.0.83.222,10.0.82.51';
const expandedIps1 = parseAndExpandIpList(ipList1);
const optimizedRanges1 = optimizeIpRanges(expandedIps1);
const formattedSet1 = formatRangesToSet(optimizedRanges1);

const ipList2 = '10.188.41.132,10.188.41.4,10.188.41.5,10.188.41.7,10.188.41.8,10.188.46.4,10.188.46.5,10.188.46.32,10.188.46.33,10.188.46.60,10.188.46.61,10.188.46.88,10.188.46.89,10.188.46.111,10.188.46.112,10.188.46.114-10.188.46.118,10.188.46.131-10.188.46.136,10.188.47.4-10.188.47.47';
const expandedIps2 = parseAndExpandIpList(ipList2);
const optimizedRanges2 = optimizeIpRanges(expandedIps2);
const formattedSet2 = formatRangesToSet(optimizedRanges2);

console.log(formattedSet1, formattedSet2);

//////////////////

// Example Sets
const set1 = new Set(formattedSet1);
const set2 = new Set(formattedSet2);

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
const nodesForIPs = mergeAndConvertToArray(formattedSet1, formattedSet2);

// Output the result
console.log(nodesForIPs);




// Create a network graph using vis-network
const nodes = new vis.DataSet(nodesForIPs);

const edges = new vis.DataSet(edgesForIPs);

const container = document.getElementById('network');
const data = { nodes: nodes, edges: edges };
const options = {
    nodes:{
        shape: 'box'
    },
    physics:{
        enabled: false
    }
};

new vis.Network(container, data, options);