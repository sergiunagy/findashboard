#Ingress and reverse proxy

We use Nginx as a solution to provide:

- web-server functionality (provides public expose endpoint)
- reverse proxy for our services (directes ingress and internal traffic to services)
- caching (where needed)

Start as a separate service.

## Configuration

Due to the way the image is built, we need a specific logic to be able to overwrite the settings with our own.
See image description in Dockerhub.

The proxy configuration is in reverse_proxy.conf.
Update as needed, then load with:
- nginx -t # check conf file
- nginx -s reload # restart server with new configuration

## WAF

ModSec WAF is enabled. 
The version is configured to support OWASP core ruleset . See 
https://owasp.org/www-project-modsecurity-core-rule-set/#:~:text=The%20OWASP%20ModSecurity%20Core%20Rule,a%20minimum%20of%20false%20alerts.