let dir = __dirname,
    fs = require('fs'),
    javascriptFiles = fs.readdirSync(`${dir}/js`),
    compressor = require('node-minify'),
    contents = fs.readFileSync(`${dir}/views/partials/scripts.ejs`, 'utf8'),
    topContent = contents.replace(/\<!-- Don't Edit below this line -->(.|[\r\n])+/, ''),
    writecontent = '';

async function awaitArray() {
    let admin = false
    let adminContent = '';
    let adminTopContent;
    let newFile;
    let both = false;
    await Functions.asyncForEach(javascriptFiles, async (file) => {
        admin = false;
        both = false;

        async function setAdmin() {
            admin = true;
            let contents = await fs.readFileSync(`${dir}/views/partials/admin/scripts.ejs`, 'utf8');
            adminTopContent = await contents.replace(/\<!-- Don't Edit below this line -->(.|[\r\n])+/, '');
        }

        let adminCheck = {
            'adminApp.js': true,
            '9-getFunctions.js': true,
            '8-postFunctions.js': true,
            '5-datatables.js': true,
            '6-datatables-select.js' : true,
            '6-dataTables-buttons.js' : true,
            '6-dataTables-editor.min.js' : true,
            '2-jquery-ui.js' : true,
            '6-buttons-print.min.js' : true,
            '6-dataTables.colReorder.js' : true,
            '6-dataTables-responsive.js' : true,
            'moment.js' : true,
            'letterAvatars.js' : true
        }

        if(adminCheck[file]) setAdmin();

        let filePath = `${dir}/js/${file}`,
            contents = await fs.readFile(filePath, 'utf8'),
            newFile = file.replace(/\d+-/, ''),
            newFilePath = `${dir}/public/js/${newFile}`;

        if (config.express.minify) {
            var promise = compressor.minify({
                compressor: config.express.minify,
                input: filePath,
                output: newFilePath
            });

            promise.then(function (min) { });

        } else {

            fs.writeFile(newFilePath, contents);

        }

        if(admin) {
        adminContent += `<script src="js/${newFile}"></script>\n`
        } else {
            writecontent += `<script src="js/${newFile}"></script>\n`
        }

        if(both) {
            adminContent += `<script src="js/${newFile}"></script>\n`
        }
        
    });


       
        
        fs.writeFile(`${dir}/views/partials/admin/scripts.ejs`, `${adminTopContent}<!-- Don't Edit below this line -->\n${adminContent}`);

        
        fs.writeFile(`${dir}/views/partials/scripts.ejs`, `${topContent}<!-- Don't Edit below this line -->\n${writecontent}`);
    
    

}

module.exports = awaitArray();