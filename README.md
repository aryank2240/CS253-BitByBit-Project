# CS253 Project Echo

Echo is a portal where IITK community members can write about their experiences, their thoughts on any topic. Basically, the platform will act as a voice of community members hence, the name "Echo".This is a user-friendly and easily accessible blog writing application that would enhance the communications in the community.
Users can also comment on other's posts, follow others making the portal personalized.


## Team Members
| Name | Roll number | Email id |
|----------|----------|----------|
| Ansh Adarsh    | 230157   | ansha23@iitk.ac.in  |
| Aryan Kumar  | 230215   | aryank23@iitk.ac.in  |
| Durbasmriti Saha     | 230393   | durbasmrit23@iitk.ac.in   |
| Gone Nishanth      | 230421    | gnishanth23@iitk.ac.in    |
| Govind Nayak Jarabala   | 230497    | govindnj23@iitk.ac.in  |
| Harsh Bhati     | 200408    | harshb20@iitk.ac.in   |
| Lavish Kanwa   | 230602    | lavishk23@iitk.ac.in   |
| Lokesh Kumar     | 230606   | lokeshk23@iitk.ac.in   |
| Someshwar Singh   | 231020    | someshwars23@iitk.ac.in |


## How to run the code

Prerequisites

Make sure you have the following installed:

- **Node.js** (Latest LTS version) – [Download](https://nodejs.org/)
- **MongoDB** (If using locally) – [Download](https://www.mongodb.com/try/download/community)

Clone the repository:
```bash
git clone [Link]
cd [path]
```
Install all the dependencies

```bash
cd backend
npm install
```
```bash
cd ../frontend
npm install
```
Run the server:
```bash
cd backend
npm start
```
Create the .env files for configurations.
```bash
touch .env
```
Put these values in the .env file for the configuration.
```bash
MONGO_URL , SMTP_HOST ,SMTP_PORT , SMTP_SECURE, EMAIL_USERNAME, EMAIL_PASSWORD, JWT_SECRET
```
Run the web-application:
```bash
cd ../frontend
npm start
```
