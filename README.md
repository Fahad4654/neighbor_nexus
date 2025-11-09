# neighbor_nexus
To generate a secret key for JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"