# How to use this repo to build Botfront UI with JAMK tweaks

## Contents
[Install Salt-Minion](#install-salt-minion)  
[Apply states](#apply-states)  
[Install Meteor](#install-meteor)  
[Install Botfront](#install-botfront)  
[Install Rasa Webchat from NPM (outside botfront folder)](#install-rasa-webchat-from-npm-outside-botfront-folder)  
[Install A fork of the Rasa Webchat UI with JAMK tweaks](#install-a-fork-of-the-rasa-webchat-ui-with-jamk-tweaks)  
[Run Botfront](#run-botfront)  
[Build Botfront dist](#build-botfront-dist)  
[Bot testing without domain](#bot-testing-without-domain)  

## Install Salt-Minion
`curl -o bootstrap-salt.sh -L https://bootstrap.saltproject.io`  
`sudo sh bootstrap-salt.sh -P -x python3`  

Check here how to config salt-minion to salt-master [https://lab.neuvola.com/jamk/infra/salt/master/-/blob/main/README.md#setup-salt-minion-to-salt-master](https://lab.neuvola.com/jamk/infra/salt/master/-/blob/main/README.md#setup-salt-minion-to-salt-master)


## Apply states
Apply all the salt states before Botfront state  

1. `salt <minion-id> state.apply system-update`  
2. `salt <minion-id> state.apply common`  
3. `salt <minion-id> state.apply api`  
4. `salt <minion-id> state.apply firewall`  
- Installing firewalld from state loses connetion betweeen salt-master and salt-minion  
- To get feedback from salt-master when running this firewall state is recomended to install firewalld before running this state  
- `salt <minion-id> pkg.install firewalld`  
- To speed up getting connection back between minon and master run `systemctl restart salt-minion.service` on salt-minion
- This is not needed when minion is created using salt-cloud, firewalld install is handled by hetzner cloud profile  
5. `salt <minion-id> state.apply mongodb`  
6. `salt <minion-id> state.apply rasa-for-botfront`  

## Install Meteor
`curl https://install.meteor.com/ | sh`  

## Install Botfront
`apt install python2`  
`cd /opt`  
`git clone git@lab.neuvola.com:jamk/frontend/botfront.git`  
`cd botfront/botfront`  
`meteor npm ci`  
`meteor npm run postinstall`  

## Install Rasa Webchat from NPM (outside botfront folder)
`cd /opt`  
`npm install rasa-webchat`  
Delete rasa-webchat from botfront/node_modules  
`rm -rf /opt/botfront/botfront/node_modules/rasa-webchat`  
Move rasa-webchat to botfront/node_modules  
`mv -v /opt/node_modules/rasa-webchat /opt/botfront/botfront/node_modules/rasa-webchat`  
Clean up  
`rm -rf node_modules package-lock.json`

## Install A fork of the Rasa Webchat UI with JAMK tweaks 
`cd /opt`  
Clone Rasa Webchat UI with JAMK tweaks  
`git clone git@lab.neuvola.com:jamk/frontend/rasa-webchat.git`  

`cd rasa-webchat`  
`npm install`  
Build rasa-webchat  
`npm run build`  
Move builded module/index.js file to botfront/node_modules/rasa-webchat  
`mv -v /opt/rasa-webchat/module/index.js /opt/botfront/botfront/node_modules/rasa-webchat/module/index.js`


## Run Botfront
`cd /opt/botfront/botfront`  
`export METEOR_ALLOW_SUPERUSER=true MONGO_URL=mongodb://admin:<password>@localhost:27017/?authSource=admin
meteor run --port 3000`

## Build Botfront dist
`meteor build --directory /opt` (This creates `bundle` folder)  
`tar -czvf botfront_dist.tar.gz bundle`  
Copy `botfront_dist.tar.gz` to Salt-Master `/srv/salt/botfront/files`

## Bot testing without domain
This works if botfront is installed with state

SSH to minion from master (ssh to minion only possible from master by default)

**Stop botfront service**  
`systemctl stop botfront.service`  
`cd /opt/botfront/bundle`  
`nano init_botfront.sh`  
**Change root url to host-ip**  
`export ROOT_URL='http://<host-ip>'` 
`sh init_botfront.sh` 

**Login to botfront**  
`http://<host-ip>  `  
**Set Credentials**  
Project → Settings → Credentials → base_url: `http://<host-ip>`

**Dashboard**  
From dashboard also set bot url to `http://<host-ip>`