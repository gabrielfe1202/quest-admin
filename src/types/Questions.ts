export class Question {
    public title!: string;
    public type!: string;
    public nextQuestionId!: string | null;
    public nextContetId!: string | null;
    public previusQuestionId!: string | null;
    public previusContetId!: string | null;

    constructor(public id: string) { }

    getNextItem(lista: Question[], contents: Content[]): nextItem | undefined {
        if (this.nextQuestionId != null) {
            const item = lista.filter(x => x.id === this.nextQuestionId)[0]
            return {
                type: 'question',
                quest: item
            }
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (this.nextContetId != null) {
            const item = contents.filter(x => x.id === this.nextContetId)[0]
            const content = new Content(item.id)
            content.title = item.title
            content.text = item.text
            content.nextQuestionId = item.nextQuestionId
            content.nextContetId = item.nextContetId
            content.previusQuestionId = item.previusQuestionId
            content.previusContetId = item.previusContetId
            return {
                type: 'content',
                content
            }
        }
    }



    getPrevItem(lista: Question[], contents: Content[]): nextItem | undefined {
        if (this.previusQuestionId != null) {
            const item = lista.filter(x => x.id === this.previusQuestionId)[0]
            return {
                type: 'question',
                quest: item
            }
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (this.previusContetId != null) {
            const item = contents.filter(x => x.id === this.previusContetId)[0]
            const content = new Content(item.id)
            content.title = item.title
            content.text = item.text
            content.nextQuestionId = item.nextQuestionId
            content.nextContetId = item.nextContetId
            content.previusQuestionId = item.previusQuestionId
            content.previusContetId = item.previusContetId
            return {
                type: 'content',
                content
            }
        }
    }

}

export class Content {
    public title!: string;
    public text!: string;
    public nextQuestionId!: string | null;
    public nextContetId!: string | null;
    public previusQuestionId!: string | null;
    public previusContetId!: string | null;

    constructor(public id: string) { }

    getNextItem(lista: Question[], contents: Content[]): nextItem | undefined {
        if (this.nextQuestionId != null) {
            const item = lista.filter(x => x.id === this.nextQuestionId)[0]
            return {
                type: 'question',
                quest: item
            }
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (this.nextContetId != null) {
            const item = contents.filter(x => x.id === this.nextContetId)[0]
            const content = new Content(item.id)
            content.title = item.title
            content.text = item.text
            content.nextQuestionId = item.nextQuestionId
            content.nextContetId = item.nextContetId
            content.previusQuestionId = item.previusQuestionId
            content.previusContetId = item.previusContetId
            return {
                type: 'content',
                content
            }
        }
    }


    getPrevItem(lista: Question[], contents: Content[]): nextItem | undefined {
        if (this.previusQuestionId != null) {
            const item = lista.filter(x => x.id === this.previusQuestionId)[0]
            return {
                type: 'question',
                quest: item
            }
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (this.previusContetId != null) {
            const item = contents.filter(x => x.id === this.previusContetId)[0]
            const content = new Content(item.id)
            content.title = item.title
            content.text = item.text
            content.nextQuestionId = item.nextQuestionId
            content.nextContetId = item.nextContetId
            content.previusQuestionId = item.previusQuestionId
            content.previusContetId = item.previusContetId
            return {
                type: 'content',
                content
            }
        }
    }

}

export class ItemQuest {
    public listQuestion!: Question[];
    public listContent!: Content[];

    constructor(question: Question[], contents: Content[]) {
        this.listQuestion = question;
        this.listContent = contents;
    }

    getFirstItem(): nextItem {
        const firstQuestion = this.listQuestion.find(x => x.previusQuestionId == null);
        const firstContent = this.listContent.find(x => x.previusContetId == null);
        
        if (firstQuestion) {
            return {
                type: 'question',
                quest: firstQuestion
            };
        } else if (firstContent) {
            return {
                type: 'content',
                content: firstContent
            };
        }
        throw new Error('No starting item found');
    }

    getLinkedList(): nextItem[] {
        const result: nextItem[] = [];
        let currentItem: nextItem | undefined = this.getFirstItem();
        
        while (currentItem) {
            result.push(currentItem);
            if (currentItem.type === 'question') {       
                currentItem = currentItem.quest.getNextItem(this.listQuestion, this.listContent)                
            } else {
                currentItem = currentItem.content.getNextItem(this.listQuestion, this.listContent)                
            }
        }

        return result;
    }
}

export type nextItem = {
    type: 'question';
    quest: Question;
} | {
    type: 'content';
    content: Content;
};

