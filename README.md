ch habe ein Test-Skript erstellt, das drei verschiedene Testfälle durchführt:
Test 1: Sendet einen Request mit environment: "test" - dieser sollte an service1 weitergeleitet werden
Test 2: Sendet einen Request mit environment: "prod" - dieser sollte an service2 weitergeleitet werden
Test 3: Sendet einen Request ohne environment-Feld - dieser sollte ebenfalls an service2 weitergeleitet werden
Um die Tests durchzuführen, müssen Sie:
Sicherstellen, dass Ihr Istio Ingress Gateway läuft und auf Port 8080 erreichbar ist
Das Skript ausführbar machen (bereits erledigt)
Das Skript ausführen:
Apply to README.md
Run
sh
Die -v Option bei curl zeigt detaillierte Informationen über den Request und die Response, einschließlich der Header.
Sie können die Ergebnisse wie folgt überprüfen:
In den Response-Headers sollten Sie den x-env-pattern Header sehen, wenn das environment-Feld im Request-Body vorhanden war
Die Weiterleitung sollte basierend auf dem Wert des Headers erfolgen:
Bei x-env-pattern: test -> Weiterleitung an service1
In allen anderen Fällen -> Weiterleitung an service2
Zusätzlich können Sie die Istio-Logs überprüfen, um zu sehen, wie der EnvoyFilter den Request verarbeitet:
Apply to README.md
Run
-n istio-system -l app=istio-ingressgateway
Möchten Sie weitere Testfälle hinzufügen oder haben Sie Fragen zur Testausführung?