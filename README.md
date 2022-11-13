# sybase-conn-ts
Um wrapper node.js simples em torno de um aplicativo Java que fornece acesso fácil aos bancos de dados Sybase via jconn3. O objetivo principal é permitir uma instalação fácil sem os requisitos de instalação e configuração de odbc ou freetds. No entanto, você precisa ter o java 1.5 ou mais recente instalado.

# Installing requirements on Debian/Ubuntu:
```
sudo apt update && sudo apt install default-jdk default-jre -y
```

# Example usage:
```
import Sybase from "sybase-conn-ts";

async function querySybase(): Promise<void> {
  const sybase = new Sybase({
    dataConection: {
      host: "HOST",
      port: 2638,
      dbname: "DATABASE",
      username: "ADMIN",
      password: "PASSWORD",
    },
    encoding: "latin1",
  });

  if (!sybase.connected) {
    await sybase.connect();
  }
  const data = await sybase.query("select * from dbo.users");

  console.log(data);

  sybase.disconnect();
}

querySybase();
```
