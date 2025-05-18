sudo kill -9 $(sudo lsof -t -i :8081)
sudo kill -9 $(sudo lsof -t -i :8082)
sudo kill -9 $(sudo lsof -t -i :8083)
# sudo kill -9 $(sudo lsof -t -i :5173)


# Start User Service
echo "Starting User Service..."
cd /home/nahid/Desktop/6th_SEM/DistSys/smart-library/user-service
PORT=8081 npm run dev &


# Start Book Service
echo "Starting Book Service..."
cd /home/nahid/Desktop/6th_SEM/DistSys/smart-library/book-service
PORT=8082 npm run dev &

# Start Loan Service
echo "Starting Loan Service..."
cd /home/nahid/Desktop/6th_SEM/DistSys/smart-library/loan-service
PORT=8083 npm run dev &

# Start Stat Service
echo "Starting Stat Service..."
cd /home/nahid/Desktop/6th_SEM/DistSys/smart-library/stat-service
PORT=8084 npm run dev &


# Start Client
cd /home/nahid/Desktop/6th_SEM/DistSys/smart-library/client
PORT=5173 npm run dev 
