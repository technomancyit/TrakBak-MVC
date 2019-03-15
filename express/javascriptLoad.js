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


        if(file === 'adminApp.js') setAdmin();

        if(file === '9-getFunctions.js') setAdmin();

        if(file === '5-datatables.js') setAdmin();

        if(file === '6-datatables-select.js') setAdmin();
        
        if(file === '6-dataTables-buttons.js') setAdmin();

        if(file === '6-dataTables-editor.min.js') setAdmin();

        if(file === '2-jquery-ui.js') setAdmin();

        if(file === '6-buttons-print.min.js') setAdmin();

        if(file === '6-dataTables.colReorder.js') setAdmin();

        if(file === '6-dataTables-responsive.js') setAdmin();

        if(file === 'moment.js') setAdmin();

        if(file === 'letterAvatars.js') setAdmin();

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