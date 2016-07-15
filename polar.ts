/*
* Rings are ordered (from inside to out) Week, Year, Month, Day, Hour, Minute
* This allows the clock to be read as follows: Wednesday, July 13, 09:59:16
*/
class PolarClock {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rings: Array<Ring>;
  private _timespan: TimeSpan;
  center: Point;
  data: Array<{ opts: RingOptions, ring: Ring }>;

  constructor(private theme: Theme) {
    this._timespan = new TimeSpan();
    this.canvas = <HTMLCanvasElement>document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    let callbacks = [
      { type: RingType.Minute, func: (ts: TimeSpan) => ts.m },
      { type: RingType.Hour, func: (ts: TimeSpan) => ts.h },
      { type: RingType.Day, func: (ts: TimeSpan) => ts.d },
      { type: RingType.Week, func: (ts: TimeSpan) => ts.w },
      { type: RingType.Month, func: (ts: TimeSpan) => ts.mo },
      { type: RingType.Year, func: (ts: TimeSpan) => ts.y }
    ];

    this.data = theme.rings.map(ro => {
      return { opts: ro, ring: new Ring(callbacks.find(c => c.type === ro.type).func) }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = document.body.style.backgroundColor = this.theme.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.data.forEach(i => {
      this.ctx.lineWidth = i.opts.width;
      this.ctx.strokeStyle = `hsl(${i.ring.percentage * 360}, 100%, 50%)`;      //i.opts.fg;
      this.ctx.beginPath();
      this.ctx.arc(this.center.x, this.center.y, i.opts.radius, i.ring.start, i.ring.end);
      this.ctx.stroke();
    });
  }

  tick(d: Date) {
    this._timespan.date = d;
    this.data.forEach(r => r.ring.update(this._timespan));
  }
}



class Ring {
  private _percentage = 0;

  constructor(private _updater: (ts: TimeSpan) => number) { } get start(): number {
    return 0 - Math.PI / 2;
  }

  get end(): number {
    return Math.PI * 2 * this._percentage - Math.PI / 2;
  }

  get percentage(): number {
    return this._percentage;
  }

  update(ts: TimeSpan) {
    this._percentage = this._updater(ts);
  }
}



class TimeSpan {
  private _date: Date;
  private _minute: number;
  private _hour: number;
  private _day: number;
  private _week: number;
  private _month: number;
  private _year: number;
  private _from: Date;
  private _to: Date;

  constructor(date = new Date()) {
    this._from = new Date();
    this._to = new Date();
    this.date = date;
  }

  set date(d: Date) {
    this._date = d;
    let from = this._from;
    let to = this._to;
    from.setTime(d.getTime());
    from.setMilliseconds(0);

    //MINUTE
    from.setSeconds(0);
    to.setTime(from.getTime());
    to.setMinutes(to.getMinutes() + 1);
    this._minute = (d.getTime() - from.getTime()) / (to.getTime() - from.getTime());

    //HOUR
    from.setMinutes(0);
    to.setTime(from.getTime());
    to.setHours(to.getHours() + 1);
    this._hour = (d.getTime() - from.getTime()) / (to.getTime() - from.getTime());

    //DAY
    from.setHours(0);
    to.setTime(from.getTime());
    to.setDate(to.getDate() + 1);
    this._day = (d.getTime() - from.getTime()) / (to.getTime() - from.getTime());

    //MONTH
    from.setDate(1);
    to.setTime(from.getTime());
    to.setMonth(to.getMonth() + 1);
    this._month = (d.getTime() - from.getTime()) / (to.getTime() - from.getTime());

    //YEAR
    from.setMonth(0);
    to.setTime(from.getTime());
    to.setFullYear(to.getFullYear() + 1);
    this._year = (d.getTime() - from.getTime()) / (to.getTime() - from.getTime());

    //WEEK
    from.setTime(d.getTime());
    from.setMilliseconds(0);
    from.setSeconds(0);
    from.setMinutes(0);
    from.setHours(0);
    from.setDate(from.getDate() - from.getDay());
    to.setTime(from.getTime());
    to.setDate(to.getDate() + 7);
    this._week = (d.getTime() - from.getTime()) / (to.getTime() - from.getTime());
  }

  get m(): number {
    return this._minute;
  }

  get h(): number {
    return this._hour;
  }

  get d(): number {
    return this._day;
  }

  get w(): number {
    return this._week;
  }

  get mo(): number {
    return this._month;
  }

  get y(): number {
    return this._year;
  }
}

interface Theme {
  bg: string;
  rings: Array<RingOptions>;
}



interface RingOptions {
  type: RingType;
  fg: string;
  bg: string;
  radius: number;
  width: number;
}


enum RingType { Minute, Hour, Day, Week, Month, Year } interface Point {
  x: number;
  y: number;
}


let theme = {
  bg: 'rgb(0,0,0)',
  rings: [
    { type: RingType.Week, fg: 'rgb(255,255,255)', bg: 'rgba(255,255,255,.2)', radius: 60, width: 30 },
    { type: RingType.Year, fg: 'rgb(255,255,255)', bg: 'rgba(255,255,255,.2)', radius: 100, width: 30 },
    { type: RingType.Month, fg: 'rgb(255,255,255)', bg: 'rgba(255,255,255,.2)', radius: 140, width: 30 },
    { type: RingType.Day, fg: 'rgb(255,255,255)', bg: 'rgba(255,255,255,.2)', radius: 180, width: 30 },
    { type: RingType.Hour, fg: 'rgb(255,255,255)', bg: 'rgba(255,255,255,.2)', radius: 220, width: 30 },
    { type: RingType.Minute, fg: 'rgb(255,255,255)', bg: 'rgba(255,255,255,.2)', radius: 260, width: 30 },
  ]
}

let pc = new PolarClock(theme);
//pc.tick(new Date(2016, 11, 25, 23,59,59,999));
//pc.draw();

let mydateobj = new Date();
let tick = () => {
  mydateobj.setTime(Date.now());
  pc.tick(mydateobj);
  pc.draw();
  window.requestAnimationFrame(tick);
};
window.requestAnimationFrame(tick);
