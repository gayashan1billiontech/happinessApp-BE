cd survey-service
cp -R ../libs .
sh ./libs/dependencies.sh
npm install --silent
sls deploy --aws-profile happines-dev -s dev --force #-f functionName
cd ..

cd notification-service
cp -R ../libs .
sh ./libs/dependencies.sh
npm install --silent
sls deploy --aws-profile happines-dev -s dev --force #-f functionName
cd ..

cd app-user-service
cp -R ../libs .
sh ./libs/dependencies.sh
npm install --silent
sls deploy --aws-profile happines-dev -s dev --force #-f functionName
cd ..

cd admin-user-service
cp -R ../libs .
sh ./libs/dependencies.sh
npm install --silent
sls deploy --aws-profile happines-dev -s dev --force #-f functionName
cd ..