const apiUrl = 'http://localhost:3000/read-csv'; // URL of the Express API

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



async function fetchData() {
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Create a network graph using vis-network
        const nodes = new vis.DataSet(data.nodes);

        const edges = new vis.DataSet(data.edges);

        const container = document.getElementById('network');
        const dataSet = { nodes: nodes, edges: edges };
        const options = {
            nodes: {
                shadow: true
            },
            physics: {
                enabled: true,
                hierarchicalRepulsion: {
                    avoidOverlap: 1
                },
            }, nodes: {
                shape: 'dot'
            }
            // ,
            // layout :{
            //     hierarchical: {
            //         direction: 'RL',
            //       }
            // }
        };

        var network = new vis.Network(container, dataSet, options);

        network.on("doubleClick", function (params) {
            params.event = "[original event]";
            const ipList = data.nodes[params.nodes[0] - 1].SourceIP;
            console.log(ipList);
            const expandedIps = parseIpList(ipList);
            console.log(expandedIps);
        });

        // Display the response on the page
        const apiResponseElement = document.getElementById('api-response');
        apiResponseElement.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('api-response').textContent = 'Error fetching data.';
    }
}

// Call the function on page load
fetchData();