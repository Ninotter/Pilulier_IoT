export class ConfigPilulier{
    private _week : Week;
    get week() : Week{
        return this._week;
    }

    constructor(week : Week){
        this._week = week;
    }

    //fromJson

    static fromBoolArray(boolArray : boolean[]) : ConfigPilulier{
        if(boolArray.length != 21){
            throw new Error("Invalid bool array length");
        }
        var days = [];
        for(let i = 0; i < 7; i++){
            days.push({
                mustTakeMorning : boolArray[i],
                mustTakeMidday : boolArray[i+7],
                mustTakeEvening : boolArray[i+14]
            });
        }
        return new ConfigPilulier(new Week(days));
    }

    //tojson
    toJson() : string{
        var json = {
            monday : this.week.monday,
            tuesday : this.week.tuesday,
            wednesday : this.week.wednesday,
            thursday : this.week.thursday,
            friday : this.week.friday,
            saturday : this.week.saturday,
            sunday : this.week.sunday
        };
        return JSON.stringify(json);
    }

    getTotalPillsToTake() : number{
        var total = 0;
        for(let day of this.week.daysArray){
            if(day.mustTakeMorning){
                total++;
            }
            if(day.mustTakeMidday){
                total++;
            }
            if(day.mustTakeEvening){
                total++;
            }
        }
        return total;
    }
}

export class Week{
    private days : Day[];
    get daysArray() : Day[]{
        return this.days;
    }

    constructor(days : Day[]){
        if(days.length != 7){
            throw new Error("Invalid number of days");
        }
        this.days = days;
    }


    get monday() : Day{
        return this.days[0];
    }
    get tuesday() : Day{
        return this.days[1];
    }
    get wednesday() : Day{
        return this.days[2];
    }
    get thursday() : Day{
        return this.days[3];
    }
    get friday() : Day{
        return this.days[4];
    }
    get saturday() : Day{
        return this.days[5];
    }
    get sunday() : Day{
        return this.days[6];
    }
}

export type Day = {
    mustTakeMorning : boolean,
    mustTakeMidday : boolean,
    mustTakeEvening : boolean,
}