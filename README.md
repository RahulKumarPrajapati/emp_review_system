# emp_review_system

1. RUN git clone https://github.com/RahulKumarPrajapati/emp_review_system.git
2. RUN cd emp_review_system/client && npm i && npm start
3. RUN cd ../server && npm i
4. In .env file put your MONGO URI in MONGO_URI and your Gemini api key in GEMINI_API_KEY
5. If you are changing PORT in .env make sure to change the port in API_URL inside client/src/shared/CONSTANT.js file as well
6. If you React is running in port other than 3000 then update it in CORS policy inside file server/app.js
7. RUN node app.js