function FindProxyForURL(url, host) {

    var lhost = host.toLowerCase();
    host = lhost ;

    if ( (host == "proxyinfo")) {
        alert("Local Ip address is: "+ myIpAddress());
    }

    if ( (host == "localhost") || shExpMatch(host,"localhost.*") || (host == "127.0.0.1")) {
        return "DIRECT";
    }


    if (
        // Wildcard domain
        shExpMatch(host, "*.corp.example.com" ) ||
        shExpMatch(host, "*.cloud.example.com" ) ||
        shExpMatch(host, "*.us.net" ) || 
        // fqdn
        shExpMatch(host, "web1.example.com") ||
        shExpMatch(host, "web1.example.net") ||
        // Ip adddresses
        shExpMatch(host, "12.12.12.1") ||
        shExpMatch(host, "12.12.12.3") ||
        // Ip Wildcard
        shExpMatch(host, "13.13.13.*") ||
        shExpMatch(host, "14.14.*.*") ||

        isPlainHostName(host)

    ) {
        return "DIRECT";
    }
    

    // specifi proxy for an application

    if ( 
        shExpMatch(host,"*.myapp.mydomain.com")
    ) {
        return "PROXY 3.3.3.3:7777: PROXY 4.4.4.4:7777"
    }

    // Proxy based on client IP subnet

    if (
        isInNet(myIpAddress(), "70.70.0.0","255.255.0.0") ||
        isInNet(myIpAddress(), "70.71.0.0","255.255.0.0")
    ) {
        return "PROXY 3.3.3.3:8080; PROXY 4.4.4.4:8080"
    } else if (
        isInNet(myIpAddress(), "80.80.0.0","255.255.0.0") ||
        isInNet(myIpAddress(), "80.81.0.0","255.255.0.0")
    ) {

        return "PROXY 3.3.3.3:9999; PROXY 4.4.4.4:9999"
    }

    // Other Cases
    var myIp = myIpAddress();
    var ipBits = myIp.split(".");
    var mySeg = parseInt(ipBits[3]);

    if ((mySeg % 2) == 0) {
        return "PROXY 2.2.2.2:8080; PROXY 1.1.1.1:8080";
    } else {
        return "PROXY 1.1.1.1:8080; PROXY 2.2.2.2:8080";
    }
    
}