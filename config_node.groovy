import jenkins.model.*
import jenkins.plugins.nodejs.tools.*

def instance = Jenkins.getInstance()
def desc = instance.getDescriptor("jenkins.plugins.nodejs.tools.NodeJSInstallation")

def installer = new NodeJSInstaller("20.10.0", "", 100)
def installerProps = new hudson.tools.InstallSourceProperty([installer])
def nodeJSInst = new NodeJSInstallation("NodeJS 20", "", [installerProps])

desc.setInstallations(nodeJSInst)
desc.save()
println "NodeJS configured successfully!"
