
# Levelution

Levelution is an automatic data logging level tracker website, allowing users to visualize their progress in their favorite games over time.

The games and metrics currently supported by Levelution are:
* Hypixel (Bedwars Level)
* Geometry Dash (Star Count)
* Geometry Dash (Moon Count)

## Installation
### Prerequisites
You will need to install the following before cloning the project:
* [Node.js & npm](https://nodejs.org/en/download/)
* [Git](https://git-scm.com/downloads)

### Clone the project
Create a folder for the project to sit in and run
```
git clone https://github.com/sdslayer/levelution.git
cd levelution
```

### Install dependencies
After you've moved into the folder, simply run
```
npm i
```

### Build project
Once all the dependencies are done downloading, run
```
npm run start
```
to run the unoptimized test build, or run
```
npm run build
```
to create a production build for deployment elsewhere.