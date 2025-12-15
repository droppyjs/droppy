# @droppyjs/remote

Remote command interface for droppy CLI.

This package provides command-line access to remote droppy instances via the REST API.

## Installation

```sh
$ yarn global add @droppyjs/remote
# or, for NPM users:
$ npm install -g @droppyjs/remote
```

## Usage

```sh
$ droppy-remote <command> <url> [args] [options]
```

### Commands

- `ping <url>` - Check if remote instance is reachable
- `list <url> <path>` - List directory contents on remote instance
- `read <url> <path>` - Read file from remote instance
- `write <url> <path>` - Write file to remote instance (requires --content or --file)
- `mkdir <url> <path>` - Create directory on remote instance
- `delete <url> <path>` - Delete file/directory on remote instance
- `move <url> <source> <dest>` - Move/rename file on remote instance

### Options

- `--user <username>` - Username for remote authentication
- `--pass <password>` - Password for remote authentication
- `--content <text>` - Content to write (for write command)
- `--file <path>` - File path to read content from (for write command)

### Examples

```sh
$ droppy-remote ping http://localhost:8989
$ droppy-remote list http://localhost:8989 / --user admin --pass secret
$ droppy-remote read http://localhost:8989 /file.txt --user admin --pass secret
$ droppy-remote write http://localhost:8989 /new.txt --content "Hello" --user admin --pass secret
$ droppy-remote write http://localhost:8989 /file.txt --file ./local.txt --user admin --pass secret
$ droppy-remote mkdir http://localhost:8989 /newdir --user admin --pass secret
$ droppy-remote delete http://localhost:8989 /old.txt --user admin --pass secret
$ droppy-remote move http://localhost:8989 /old.txt /new.txt --user admin --pass secret
```

