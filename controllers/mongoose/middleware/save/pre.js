module.exports = (model, modelName) => {
    if(!model.lastQuery) model.lastQuery = {}
    return model.pre('save', function (next) {
      model.lastQuery[this._id] = this;

        this.wasNew = this.isNew;
        next();
    });

}