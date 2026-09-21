location ~ ^/ambiente-de-pruebas-jr(?:/|$) {
    auth_basic "Jardines del Renacer - capacitacion";
    auth_basic_user_file /etc/nginx/.htpasswd-jdr-training;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:3002;
}
