import express = require('express');
import store = require('../services/taskStore');

export class TasksController {
  showTasksDefault(req: express.Request, res: express.Response): void {
    const context = this.buildRequestContext(req);
    res.cookie('sort', context.sort);
    res.cookie('direction', context.direction);
    res.cookie('showFinished', context.showfinished);
    res.cookie('isDarkmode', context.isDarkmode);
    res.cookie('page', 'taskoverview');
    res.cookie('init', true);
    store.getByFinishedBy(1, false, function (err, tasks) {
      context.todos = tasks;
      context.isListEmpty = tasks.length == 0;
      res.render('index', context);
    });
  }

  toggleProp(req: express.Request, res: express.Response): void {
    const context = this.buildRequestContext(req);
    switch (req.params.prop) {
      case 'theme_dark_true':
        context.isDarkmode = true;
        context.invertedisDarkmode = false;
        break;
      case 'theme_dark_false':
        context.isDarkmode = false;
        context.invertedisDarkmode = true;
        break;
      case 'showFinished_true':
        context.showfinished = true;
        context.invertedshowfinished = false;
        break;
      case 'showFinished_false':
        context.showfinished = false;
        context.invertedshowfinished = true;
        break;
    }
    console.log(req.cookies.page);
    if (req.cookies.page == 'taskoverview') {
      this.showTaskOverview(context, req, res);
    } else if (req.cookies.page == 'taskedit') {
      if (req.cookies.currenttask == 'new') {
        const taskContext = {
          task: {
            _id: 'new',
          },
          isDarkmode: context.isDarkmode,
          invertedisDarkmode: !context.isDarkmode,
          title: 'Task erstellen',
        };
        this.showTaskInternal(taskContext, req, res);
      } else {
        store.getByID(req.cookies.currenttask, (err, tasks) => {
          const taskContext = {
            task: tasks[0],
            isDarkmode: context.isDarkmode,
            invertedisDarkmode: !context.isDarkmode,
            title: 'Task bearbeiten',
          };
          this.showTaskInternal(taskContext, req, res);
        });
      }
    }
  }

  buildRequestContext(req: express.Request): any {
    if (req.cookies.init != 'true') {
      return {
        sort: 'finished',
        todos: {},
        isListEmtpy: false,
        direction: -1,
        isDirectionAsc: false,
        isDirectionDesc: true,
        invertedDirection: 1,
        isFinishedSorting: true,
        isCreationSorting: false,
        isImportanceSorting: false,
        showfinished: false,
        invertedshowfinished: true,
        isDarkmode: true,
        invertedisDarkmode: false,
      };
    }
    return {
      title: 'Taskübersicht',
      sort: req.cookies.sort,
      todos: {},
      isListEmtpy: false,
      direction: req.cookies.direction,
      isDirectionAsc: req.cookies.direction == 1,
      isDirectionDesc: req.cookies.direction == -1,
      invertedDirection: req.cookies.direction * -1,
      showfinished: req.cookies.showFinished == 'true',
      invertedshowfinished: !(req.cookies.showFinished == 'true'),
      isFinishedSorting: req.cookies.sort == 'finished',
      isCreationSorting: req.cookies.sort == 'creation',
      isImportanceSorting: req.cookies.sort == 'importance',
      isDarkmode: req.cookies.isDarkmode == 'true',
      invertedisDarkmode: req.cookies.isDarkmode != 'true',
    };
  }

  showTaskOverview(context: any, req: express.Request, res: express.Response): void {
    res.cookie('sort', context.sort);
    res.cookie('direction', context.direction);
    res.cookie('showFinished', context.showfinished);
    res.cookie('isDarkmode', context.isDarkmode);
    res.cookie('page', 'taskoverview');

    res.location('/tasks/');
    switch (context.sort) {
      case 'finished':
        store.getByFinishedBy(context.direction, context.showfinished, (err, tasks) => {
          context.todos = tasks;
          context.isListEmpty = tasks.length == 0;
          res.render('index', context);
        });
        break;
      case 'creation':
        store.getByCreationDate(context.direction, context.showfinished, (err, tasks) => {
          context.todos = tasks;
          context.isListEmpty = tasks.length == 0;
          res.render('index', context);
        });
        break;
      case 'importance':
        store.getByImportance(context.direction, context.showfinished, (err, tasks) => {
          context.todos = tasks;
          context.isListEmpty = tasks.length == 0;
          res.render('index', context);
        });
        break;
    }
  }

  showTasksSorted(req: express.Request, res: express.Response): void {
    const context = this.buildRequestContext(req);
    if (req.params.attr != context.sort || req.params.dir != context.direction) {
      switch (req.params.attr) {
        case 'finished':
          if (context.sort == 'finished') {
            context.direction = req.cookies.direction * -1;
            context.isDirectionAsc = context.direction == 1;
            context.isDirectionDesc = context.direction == -1;
            context.invertedDirection = context.direction * -1;
          }
          context.isCreationSorting = false;
          context.isImportanceSorting = false;
          context.isFinishedSorting = true;
          context.sort = 'finished';
          break;
        case 'creation':
          if (context.sort == 'creation') {
            context.direction = req.cookies.direction * -1;
            context.isDirectionAsc = context.direction == 1;
            context.isDirectionDesc = context.direction == -1;
            context.invertedDirection = context.direction * -1;
          }
          context.isCreationSorting = true;
          context.isImportanceSorting = false;
          context.isFinishedSorting = false;
          context.sort = 'creation';
          break;
        case 'importance':
          if (context.sort == 'importance') {
            context.direction = req.cookies.direction * -1;
            context.isDirectionAsc = context.direction == 1;
            context.isDirectionDesc = context.direction == -1;
            context.invertedDirection = context.direction * -1;
          }
          context.isCreationSorting = false;
          context.isImportanceSorting = true;
          context.isFinishedSorting = false;
          context.sort = 'importance';
          break;
      }
    }

    this.showTaskOverview(context, req, res);
  }

  showTask(req: express.Request, res: express.Response): void {
    if (req.params.taskid == 'new') {
      this.createTask(req, res);
      return;
    }
    store.getByID(req.params.taskid, (err, tasks) => {
      const context = {
        task: tasks[0],
        isDarkmode: req.cookies.isDarkmode == 'true',
        invertedisDarkmode: req.cookies.isDarkmode != 'true',
        title: 'Task bearbeiten',
      };
      this.showTaskInternal(context, req, res);
    });
  }

  private showTaskInternal(context: any, req: express.Request, res: express.Response): void {
    res.cookie('page', 'taskedit');
    res.cookie('currenttask', context.task._id);
    res.cookie('isDarkmode', context.isDarkmode);
    res.render('task', context);
  }

  createTask(req: express.Request, res: express.Response): void {
    const context = {
      task: {
        _id: 'new',
      },
      isDarkmode: req.cookies.isDarkmode == 'true',
      invertedisDarkmode: req.cookies.isDarkmode != 'true',
      title: 'Task erstellen',
    };
    this.showTaskInternal(context, req, res);
  }

  saveTask(req: express.Request, res: express.Response): void {
    if (req.params.taskid == 'new') {
      store.insert(req.body.title, req.body.desc, req.body.importance, req.body.finishedBy, req.body.finished === 'on');
    } else {
      store.update(
        req.params.taskid,
        req.body.title,
        req.body.desc,
        req.body.importance,
        req.body.finishedBy,
        req.body.finished === 'on',
      );
    }
    this.showTaskOverview(this.buildRequestContext(req), req, res);
  }
}

export const tasksController = new TasksController();
