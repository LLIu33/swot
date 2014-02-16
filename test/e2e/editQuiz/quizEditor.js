// Page Object for the quiz editor page
var QuizEditorPage = function () {
    var ptor = protractor.getInstance();
    var page = this;

    this.quizNameField = element(by.model('quiz.name'));
    this.saveButton = element(by.id('save'));
    this.loadMessage = element(by.id('load-message'));
    this.saveStatus = element(by.id('save-message'));
    this.saveError = element(by.binding('{{saveError}}'));
    this.addQuestionButton = element(by.id('add-question'));

    /**
     * Loads the quiz editor for a new quiz.
     */
    this.create = function () {
        browser.get(ptor.baseUrl + 'create').then(function () {
            ptor.waitForAngular();
        });
    };

    /**
     * Loads an existing quiz for editing, waiting until it has finished loading.
     */
    this.edit = function (id) {
        var self = this;
        browser.get(ptor.baseUrl + 'edit/' + id).then(function () {
            ptor.waitForAngular();
            // Wait for the quiz to finish loading (as indicated by the "Loading..." message being
            // hidden).
            ptor.wait(function () {
                return self.loadMessage.isDisplayed().then(function (v) {
                    return v === false;
                });
            });
        });
    };

    /**
     * Clicks the save button and waits for either a save confirmation message (saveStatus), or an
     * error (saveError).
     */
    this.save = function () {
        var saveStatus = this.saveStatus;
        var saveError = this.saveError;
        return this.saveButton.click().then(function () {
            return ptor.wait(function () {
                return (saveStatus.getText() || saveError.getText());
            });
        });
    };

    /**
     * Retrieves the question editor field for the given question number (questions start at number
     * one, not zero). Note that this returns a promise object, not the field itself.
     */
    this.getQuestion = function (number) {
        return element(by.repeater('question in quiz.questions').row(number - 1))
                .findElement(by.css('.question-editor'));
    };

    /**
     * Retrieves the answer field for the given question number (questions start at number one, not
     * zero). Returns a promise.
     */
    this.getAnswer = function (number) {
        return element(by.repeater('question in quiz.questions').row(number - 1)).findElement(by.css('.answer-editor'));
    };

    /**
     * Gets the number of questions currently in the quiz (returns a promise)
     */
    this.getNumQuestions = function () {
        //return element(by.repeater('question in quiz.questions')).count();
        return ptor.findElements(by.repeater('question in quiz.questions')).then(function (arr) {
            return arr.length;
        });
    };

    /**
     * Clicks the "Add Question" button and waits for the animation to finish playing. Moves the mouse
     * away from the button so the tooltip disappears.
     */
    this.addQuestion = function () {
        return this.addQuestionButton.click().then(function () {
            return page.getNumQuestions();
        }).then(function (last) {
            browser.actions().mouseMove(page.getQuestion(last)).perform();
            ptor.sleep(800);
        });
    };

    /**
     * Gets the drag handle for a question (which allows reordering questions using drag and drop).
     */
    this.getDragHandle = function (number) {
        return element(by.repeater('question in quiz.questions').row(number - 1))
                .findElement(by.css('.drag-handle'));
    };

    /**
     * Reorders questions by dragging and dropping.
     */
    this.moveQuestion = function (questionToMove, positionToMoveTo) {
        return page.getQuestion(positionToMoveTo).then(function (dest) {
            page.getDragHandle(questionToMove).then(function (dragHandle) {
                ptor.actions().dragAndDrop(dragHandle, dest).perform();
                ptor.sleep(800);    // wait for animation
            });
        });
    };
};

module.exports = QuizEditorPage;
