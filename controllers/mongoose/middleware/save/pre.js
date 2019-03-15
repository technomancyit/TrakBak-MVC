module.exports = (model, modelName) => {

    return model.pre('save', function (next) {
        console.log(model.lastQuery = this);
        console.log('RAN');
        this.wasNew = this.isNew;
        next();
    });

}